import { IncomingService } from './incoming-service';
import { AssociateService } from './associate-service';

type IVideo = {
  name: string,
  selected: boolean
}

class AssociateModalController {
  static $inject: string[] = ['$mdDialog'];
  public isAllSelected: boolean = false;
  public videoNames: string[];
  public videos: IVideo[];
  constructor(
    private _$mdDialog: angular.material.IDialogService
  ) {
    this.videos = this.videoNames.map(name => {
      return {
        name,
        selected: false
      };
    });
  }

  public cancel() {
    this._$mdDialog.cancel();
  }

  public associateSelection() {
    const selectedVideos = this.videos.filter(video => video.selected)
                                      .map(video => video.name);
    this._$mdDialog.hide(selectedVideos);
  }

  public selectAll() {
    this.videos = this.videos.map((video) => {
      return {
        name: video.name,
        selected: this.isAllSelected
      };
    });
  }
}

export class Associate {
  public recordId: string;

  static $inject: string[] = ['$mdDialog', 'incomingService', 'associateService'];
  constructor(
    private _$mdDialog: ng.material.IDialogService,
    private _incomingService: IncomingService,
    private _associateService: AssociateService
  ) {}

  openVideoList() {
    this._incomingService.getIncoming().then((videoNames: string[]) => {
      this._$mdDialog.show({
        controller: AssociateModalController,
        controllerAs: 'state',
        bindToController: true,
        locals: {videoNames},
        templateUrl: '/mtna/record/associate/incoming-template.html'
      })
      .then(this.associateVideos.bind(this));
    });
  }

  onUpdateRecord(record: any) {
    throw new Error('Abstract method onUpdateRecord called with no overload.');
  }

  associateVideos(videoNames: string[]) {
    if (!videoNames.length) {
      return;
    }
    this._associateService.associateVideos(this.recordId, videoNames)
    .then((updatedRecordData) => {
      this.onUpdateRecord({updatedRecordData});
    });
  }

  static directive(): angular.IDirective {
    return {
      template: `<md-button ng-click="state.openVideoList()">Add Video</md-button>`,
      scope: {},
      controller: Associate,
      controllerAs: 'state',
      bindToController: {
        recordId: '@',
        onUpdateRecord: '&'
      }
    };
  }
  static $depends: string[] = [
    'ngMaterial',
    IncomingService.module.name,
    AssociateService.module.name
  ];
  static module: angular.IModule = angular.module(
    'mtna.record.associate', Associate.$depends
  )
  .directive('associate', Associate.directive);
}
