import {
  default as RecordModule,
  IRecordResource,
  RecordResource
} from './record/record-resource';

import {IRecord, Record} from '../../shared/record/record';
import {RecordViewer} from './record/record-component';
import {Searchbar} from './searchbar/searchbar-component';
import {ISearchQuery, SEARCH_EVENT} from './searchbar/searchbar-service';
import {ElemClick} from './elem-click/elem-click-directive';
import {LocationService} from './location/location-service';
import {ToastService} from './toast/toast-service';

export class Archive {
  public inFlight: boolean = false;
  public searching: boolean = false;
  public search: string = '';

  public records: Record[] = [];
  public pre: Record[] = [];
  public current: Record = null;
  public lastRecordSaved: Record = null;
  public currentIndex: number = -1;
  public post: Record[] = [];

  public error: any = null;
  constructor(private $scope: ng.IScope, private $q: ng.IQService,
              private $anchorScroll: ng.IAnchorScrollService,
              private $timeout: ng.ITimeoutService,
              private RecordResource: RecordResource,
              private Toaster: ToastService,
              private _http: ng.IHttpService,
              private _location: LocationService) {
    $scope.$on(SEARCH_EVENT, (event: any, query: ISearchQuery) => {
      this.doSearch(query);
    });
    if (this._location.hasRecordId) {
      // Do search and _force_ selection.
      const id = this._location.currentId;
      this.doSearch({
        after: this._location.startDate,
        before: this._location.endDate,
        query: this._location.queryString,
      }).then(() => {
        this.select(this.records.filter((_) => _.id === id)[0]);
      });
    } else if (this._location.hasSearch) {
      this.doSearch({
        after: this._location.startDate,
        before: this._location.endDate,
        query: this._location.queryString,
      });
    }
  }

  doSearch(query: ISearchQuery): Promise<void> {
    this.inFlight = true;
    return this.RecordResource.query(query)
        .$promise.then((__: IRecordResource[]) => {
           this.inFlight = false;
           this.records = __.map(Record.fromObj).sort(Record.comparator);
           this.select(null);
           this._location.startDate = query.after;
           this._location.endDate = query.before;
           this._location.queryString = query.query;
         })
        .catch(() => { this.inFlight = false; });
  }

  select(record: Record): void {
    this.currentIndex = this.records.indexOf(record);
    if (this.currentIndex === -1) {
      // Unsetting the current element
      this.current = null;
      this.pre = this.records;
      this.post = [];
    } else {
      this.current = record;
      this.RecordResource.get({id : record.id})
          .$promise.then((_: IRecord) => {
            this.current.merge(Record.fromObj(_));
          });
      this.pre = this.records.slice(0, this.currentIndex);
      this.post = this.records.slice(this.currentIndex + 1);
      this.$timeout(() => {
        this.$anchorScroll(`record-${this.current.id}`);
      });
    }
    this._location.current = this.current;
  }

  save(record: Record): Promise<any> {
    if (this.inFlight) {
      // #74: Don't have more than one request at at time.
      return;
    }
    let success = () => {
      this.Toaster.toast(`Saved ${record.label}`);
      this.lastRecordSaved = record;
      record.baseId = record.id;
      record.isNewTape = false;
    };
    let error = (err: any) => {
      this.error = err;
      this.Toaster.error(
        `${this.error.status} Error saving ${record.label}: ${this.error.data}`
      );
    };
    let done = (err: any) => { this.inFlight = false; };
    this.inFlight = true;
    let params = {id : record.id, replaceId : record.baseId};
    if (record.isNewTape || !record.modified) {
      delete params.replaceId;
    }
    let update = this.RecordResource.update(params, record)
      .$promise.then(() => {
         if (!record.rawImage) {
           return;
         }
         return this._http.post(`/api/record/#{record.id}/upload`, {
           filename : record.rawImage.name,
           image : record.rawImage
         });
       });
    update
      .then(success, error)
      .then(done, done);
    return update;
  }

  addTape(): void {
    this.collapse();
    let record = new Record('', '');
    record.isNewTape = true;
    if (this.lastRecordSaved) {
      record.family = this.lastRecordSaved.family;
      record.medium = this.lastRecordSaved.medium;
    }
    this.records.push(record);
    this.select(record);
  }

  collapse(): void {
    this.current = null;
    this.pre = this.records;
    this.post = null;
  }

  static directive(): angular.IDirective {
    return {
      controller : Archive,
      controllerAs : 'state',
      bindToController : true,
      scope : {},
      templateUrl : '/mtna/archive-template.html'
    };
  }

  static $inject: string[] = [
    '$scope',
    '$q',
    '$anchorScroll',
    '$timeout',
    'RecordResource',
    ToastService.serviceName,
    '$http',
    LocationService.serviceName,
    '$timeout'
  ];
  static $depends: string[] = [
    RecordModule.name,
    RecordViewer.module.name,
    Searchbar.module.name,
    ElemClick.module.name,
    LocationService.module.name,
    ToastService.module.name,
    'ngMaterial',
    'angular.filter'
  ];
  static module: angular.IModule =
      angular.module('mtna.archive', Archive.$depends)
          .directive('archive', Archive.directive);
}
