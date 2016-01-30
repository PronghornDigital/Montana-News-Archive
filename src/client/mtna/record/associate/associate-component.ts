import { IncomingService } from './incoming-service';

class AssociateModalController {
  static $inject: string[] = ['$mdDialog'];
  constructor(
    private _$mdDialog: angular.material.IDialogService
  ) {}

  public cancel() {
    this._$mdDialog.cancel();
  }

  public associateSelection() {
    console.log('Finish me');
  }

  public selectAll() {
    console.log('Finish me');
  }
}

export class Associate {

  static $inject: string[] = ['$mdDialog', 'incomingService'];
  constructor(
    private _$mdDialog: ng.material.IDialogService,
    private _incomingService: IncomingService
  ) {}

  openVideoList() {
    this._incomingService.getIncoming().then((incoming: string[]) => {
      this._$mdDialog.show({
        controller: AssociateModalController,
        controllerAs: 'state',
        bindToController: true,
        locals: {incoming},
        template: `
          <md-dialog flex="50">
            <md-toolbar>
              <h3>Associate film</h3>
            </md-toolbar>
            <md-dialog-content class="md-dialog-content">
              <md-list>
                <md-list-item>
                  <p>Select all</p>
                  <md-checkbox></md-checkbox>
                </md-list-item>
              </md-list>
            </md-dialog-content>
            <md-dialog-actions>
              <md-button ng-click="state.cancel()">Cancel</md-button>
              <md-button class="md-primary"
                         ng-click="state.associateSelection()">Associate</md-button>
            </md-dialog-actions>
          </md-dialog>
        `
      });
    });
  }

  static directive(): angular.IDirective {
    return {
      template: `<md-button ng-click="state.openVideoList()">Associate</md-button>`,
      scope: {},
      controller: Associate,
      controllerAs: 'state',
      bindToController: {}
    };
  }
  static $depends: string[] = ['ngMaterial', IncomingService.module.name];
  static module: angular.IModule = angular.module(
    'mtna.record.associate', Associate.$depends
  )
  .directive('associate', Associate.directive);
}
