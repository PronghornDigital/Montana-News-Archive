import { UploaderService } from './uploader-service';
import { FileChange } from './file-change-directive';
export class Uploader {

  constructor(private _uploaderService: UploaderService) { }

  doUpload() {
    console.log('DOUPLOADSON');
  }

  static directive(): angular.IDirective {
    return {
      controller: Uploader,
      controllerAs: 'state',
      bindToController: true,
      scope: {},
      templateUrl: '/mtna/uploader/uploader-template.html'
    };
  }

  static selector: string = 'mtnaUploader';

  static $inject: string[] = [UploaderService.serviceName];
  static $depends: string[] = [
    UploaderService.module.name,
    FileChange.module.name
  ];

  static module: angular.IModule = angular.module(
    'mtna.archive.uploader', Uploader.$depends
  ).directive(Uploader.selector, Uploader.directive);
}
