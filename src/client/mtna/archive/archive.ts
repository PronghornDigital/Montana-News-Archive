import {
  Record
} from '../../../shared/record/record';

import {
  default as RecordModule,
  RecordResource
} from '../record/record-resource';

import {
  RecordViewer
} from '../record/record-viewer';

export class Archive {
  public records: Record[];
  constructor(
    private recordResource: RecordResource
  ) {
    this.recordResource.query().$promise.then((records: any[]) => {
      this.records = records.map(Record.fromObj);
    });
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
