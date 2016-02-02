export class AssociateService {
  static $inject: string[] = ['$http'];
  constructor(
    private _$http: angular.IHttpService
  ) {}

  public associateVideos(recordId: string, videoNames: string[]) {
    return this._$http({
      method: 'POST',
      url: `/api/records/${recordId}/associate`,
      data: videoNames
    })
    .then((res) => res.data);
  }

  static $depends: string[] = [];
  static module: angular.IModule = angular.module(
    'mtna.record.associateService', AssociateService.$depends
  )
  .service('associateService', AssociateService);
}
