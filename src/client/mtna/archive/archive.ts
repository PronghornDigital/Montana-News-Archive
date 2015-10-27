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
  public records: Record[];
  public editing: Record = null;
  constructor(
    private RecordResource: RecordResource
  ) {
    this.RecordResource.query().$promise.then((__: Record[]) => {
      this.records = __.map((_: Record) => (_.id = makeRecordId(_.label), _));
    });
  }

  edit(record: Record): void {
    if (record === null) {
      let done = () => this.saving = false;
      this.saving = true;
      Promise.all(
        this.records.map((_: Record) => {
          _.id = makeRecordId(_.label);
          return _;
        }).map((_: Record) => _.$save())
      )
      .then(() => this.editing = null)
      .then(done, done);
    } else {
      this.editing = record;
    }
  }

  addTape(): void {
    this.editing = new this.RecordResource({
      id: '',
      label: '',
      family: '',
      stories: []
    });
    this.records.push(this.editing);
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

  static $inject: string[] = ['RecordResource'];
  static $depends: string[] = [
    RecordModule.name,
    RecordViewer.module.name,
    'ngMaterial'
  ];
  static module: angular.IModule = angular.module(
    'mtna.archive', Archive.$depends
  ).directive('archive', Archive.directive);
}
