import {
  makeRecordId
} from '../../../shared/record/record';

import {
  default as RecordModule,
  Record,
  RecordResource
} from '../record/record-resource';

import {
  RecordViewer
} from '../record/record-viewer';

export class Archive {
  public saving: boolean = false;
  public records: Record[] = [];
  public editing: Record = null;
  public error: any = null;
  constructor(
    private $q: ng.IQService,
    private RecordResource: RecordResource
  ) {
    this.RecordResource.query().$promise.then((__: Record[]) => {
      this.records = __.map((_: Record) => (_.id = makeRecordId(_.label), _));
    });
  }

  edit(record: Record): void {
    // debugger;
    let success = () => this.editing = record;
    let error = (err: any) => this.error = err;
    let done = () => this.saving = false;
    if (this.editing && record !== this.editing) {
      this.saving = true;
      this.$q.all(
        this.records.map((_: Record) => {
          _.id = makeRecordId(_.label);
          return _;
        }).map((_: Record) => _.$save())
      )
      .then(success, error)
      .then(done, done);
    } else {
      success();
    }
  }

  addTape(): void {
    let record = new this.RecordResource({
      id: '',
      label: '',
      family: '',
      stories: []
    });
    this.records.push(record);
    this.edit(record);
  }

  static directive(): angular.IDirective {
    return {
      controller: Archive,
      controllerAs: 'state',
      bindToController: true,
      scope: {},
      templateUrl: '/mtna/archive/template.html'
    };
  }

  static $inject: string[] = ['$q', 'RecordResource'];
  static $depends: string[] = [
    RecordModule.name,
    RecordViewer.module.name,
    'ngMaterial'
  ];
  static module: angular.IModule = angular.module(
    'mtna.archive', Archive.$depends
  ).directive('archive', Archive.directive);
}
