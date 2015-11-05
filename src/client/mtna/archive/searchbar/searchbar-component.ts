export class Searchbar {
  public searching: boolean = false;

  static directive(): angular.IDirective {
    return {
      controller: Searchbar,
      controllerAs: 'state',
      bindToController: true,
      scope: {},
      templateUrl: '/mtna/archive/searchbar/searchbar-template.html'
    };
  }

  static selector: string = 'mtnaArchiveSearchbar';
  static $inject: string[] = [];
  static $depends: string[] = [
    'ngMaterial'
  ];
  static module: angular.IModule = angular.module(
    'mtna.archive.searchbar', Searchbar.$depends
  ).directive(Searchbar.selector, Searchbar.directive);
}
