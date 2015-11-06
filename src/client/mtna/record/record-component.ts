import {
  Record
} from '../../../shared/record/record';

export class RecordViewer {
  public record: Record;
  public editing: boolean;
  public doneEditing: any;

  static directive(): angular.IDirective {
    return {
      controller: RecordViewer,
      controllerAs: 'state',
      bindToController: true,
      scope: {
        record: '=',
        editing: '=',
        doneEditing: '&'
      },
      templateUrl: '/mtna/record/record-template.html'
    };
  }

  static $inject: string[] = [];
  static $depends: string[] = [];
  static module: angular.IModule = angular.module(
    'mtna.recordViewer', RecordViewer.$depends
  ).directive('recordViewer', RecordViewer.directive);
}
