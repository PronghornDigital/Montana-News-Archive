import {
  default as RecordModule,
  IRecordResource,
  RecordResource
} from './record/record-resource';

import {Record} from '../../shared/record/record';
import {RecordViewer} from './record/record-component';
import {Searchbar} from './searchbar/searchbar-component';
import {ISearchQuery, SEARCH_EVENT} from './searchbar/searchbar-service';
import {ElemClick} from './elem-click/elem-click-directive';
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

  public editing: Record = null;

  public error: any = null;
  constructor(private $scope: ng.IScope, private $q: ng.IQService,
              private RecordResource: RecordResource,
              private Toaster: ToastService, private _http: ng.IHttpService) {
    $scope.$on(SEARCH_EVENT, (event: any, query: ISearchQuery) => {
      this.inFlight = true;
      this.RecordResource.query(query)
          .$promise.then((__: IRecordResource[]) => {
                     this.inFlight = false;
                     this.records = __.map(Record.fromObj);
                     this.select(null);
                   })
          .catch(() => { this.inFlight = false; });
    });
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
          .$promise.then((_: Record) => { this.current.merge(_); });
      this.pre = this.records.slice(0, this.currentIndex);
      this.post = this.records.slice(this.currentIndex + 1);
    }
  }

  save(record: Record): void {
    if (this.inFlight) {
      // #74: Don't have more than one request at at time.
      return;
    }
    let success = () => {
      this.Toaster.toast(`Saved ${record.label}`);
      this.lastRecordSaved = record;
    };
    let error = (err: any) => {
      this.error = err;
      this.Toaster.toast(`Error inFlight ${record.label}: ${this.error}`, -1);
    };
    let done = () => this.inFlight = false;
    this.inFlight = true;
    let params = {id : record.id, replaceId : record.baseId};
    if (!record.modified) {
      delete params.replaceId;
    }
    this.RecordResource.update(params, record)
        .$promise.then(() => {
                   if (!record.rawImage) {
                     return;
                   }
                   this._http.post(`/api/record/#{record.id}/upload`, {
                     filename : record.rawImage.name,
                     image : record.rawImage
                   });
                 })
        .catch(function(err: any) {
          this.errors = err;
          throw err;
        })
        .then(success, error)
        .then(done, done);
  }

  edit(record: Record): void {
    if (this.inFlight) {
      // #74: Don't have more than one request at at time.
      return;
    }
    let success = () => this.editing = record;
    let error = (err: any) => this.error = err;
    let done = () => this.inFlight = false;
    if (this.editing && record !== this.editing) {
      this.inFlight = true;
      (new this.RecordResource(this.editing))
          .$save()
          .then(success, error)
          .then(done, done);
    } else {
      success();
    }
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
    this.edit(record);
    this.select(record);
  }

  collapse(): void {
    if (this.current && !this.inFlight) {
      this.save(this.current);
    }
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

  static $inject: string[] =
      [ '$scope', '$q', 'RecordResource', ToastService.serviceName, '$http' ];
  static $depends: string[] = [
    RecordModule.name,
    RecordViewer.module.name,
    Searchbar.module.name,
    ElemClick.module.name,
    ToastService.module.name,
    'ngMaterial',
    'angular.filter'
  ];
  static module: angular.IModule =
      angular.module('mtna.archive', Archive.$depends)
          .directive('archive', Archive.directive);
}
