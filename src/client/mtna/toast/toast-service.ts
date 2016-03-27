export class ToastService {
  constructor(private _mdToast: angular.material.IToastService) { }

  private _position: string = 'bottom right';
  get position(): string { return this._position; }

  _config(
      message: string,
      hideDelay: number
  ): angular.material.ISimpleToastPreset {
    return this._mdToast.simple()
        .textContent(message)
        .position(this.position)
        .hideDelay(hideDelay)
        .action('OK');
  }

  toast(message: string, hideDelay: number = 3000) {
    let opts = this._config(message, hideDelay);
    this._mdToast.show(opts);
  }

  error(message: string) {
    let opts = this._config(message, 0)
      // TODO: Add this after 1.1.0 is available
      // .highlightClass('md-warn')
      ;
    this._mdToast.show(opts);
  }

  static serviceName: string = 'ToastService';
  static $inject: string[] = ['$mdToast'];
  static $depends: string[] = ['ngMaterial'];
  static module: angular.IModule =
    angular.module(ToastService.serviceName, ToastService.$depends)
    .service(ToastService.serviceName, ToastService);
}
