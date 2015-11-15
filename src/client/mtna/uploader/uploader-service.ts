export class UploaderService {

  constructor(private _http: angular.IHttpService) { }

  upload(): angular.IPromise<any> {
    return this._http({
      url: '/api/upload',
      method: 'GET',
    });
  }

  static serviceName: string = 'mtnaUploaderService';

  static $inject: string[] = ['$http'];
  static $depends: string[] = [];

  static module: angular.IModule = angular.module(
      'mtna.archive.uploaderservice', UploaderService.$depends
      ).service(UploaderService.serviceName, UploaderService);
}
