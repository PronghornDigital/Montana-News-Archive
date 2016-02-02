export class IncomingService {
  static $inject: string[] = ['$http'];
  constructor(
    private _$http: angular.IHttpService
  ) {}

  public getIncoming() {
    return this._$http({
      url: '/api/videos/incoming',
      method: 'GET'
    }).then(res => res.data);
  }

  static $depends: string[] = [];
  static module: angular.IModule = angular.module(
      'mtna.record.associate.incomingService', IncomingService.$depends
    ).service('incomingService', IncomingService);
}
