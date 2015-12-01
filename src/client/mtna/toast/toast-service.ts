export class ToastService {
  constructor(private _mdToast: angular.material.IToastService) { }

  private _position: string = 'bottom right';
  get position(): string { return this._position; }

  toast(message: string, timeout: number = 3000) {
    let opts = this._mdToast.simple()
        .content(message)
        .position(this.position)
        .action('OK');

    if (timeout <= 0) {
      opts.hideDelay(timeout);
    }

    this._mdToast.show(opts);
  }

  static name: string = 'ToastService';
  static $inject: string[] = ['$mdToast'];
  static $depends: string[] = ['ngMaterial'];
  static module: angular.IModule =
    angular.module(ToastService.name, ToastService.$depends)
    .service(ToastService.name, ToastService);
}
