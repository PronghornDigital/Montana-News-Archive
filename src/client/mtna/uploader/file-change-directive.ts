// import { UploaderService } from './uploader-service';

export class FileChange {

  // constructor() { }

  // doUpload() {
  //   console.log('DOUPLOADSON');
  // }

  static directive(): angular.IDirective {
    return {
      // controller: Uploader,
      // controllerAs: 'state',
      // bindToController: true,
      // transclude: true,
      scope: {fileChange: '&'},
      link: (scope: any, element: any, attrs: any) => {
        console.log('fileChange Directive Link Function!');
        console.log(scope, element, attrs);
        element.bind('change', () => {
          scope.$apply( () => {
            scope['fileChange'](element[0].files);
          });
        });
      }
      // templateUrl: '/mtna/uploader/uploader-template.html'
    };
  }

  static selector: string = 'fileChange';
  static $inject: string[] = [];
  static $depends: string[] = [];
  static module: angular.IModule = angular.module(
    'mtna.archive.fileChange', FileChange.$depends
  ).directive(FileChange.selector, FileChange.directive);
}
