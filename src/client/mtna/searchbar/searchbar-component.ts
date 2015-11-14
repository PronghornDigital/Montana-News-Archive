import {
  SearchService, ISearchQuery
} from './searchbar-service';

export class Searchbar {
  public searching: boolean = false;
  public searchString: string = '';

  constructor(
      private _searchService: SearchService,
      private _$log: ng.ILogService
  ) {
  }

  search() {
    const searchQuery: ISearchQuery = {
      query: this.searchString
    };
    this._searchService.search(searchQuery).then(this._$log.info);
  }

  static directive(): angular.IDirective {
    return {
      controller: Searchbar,
      controllerAs: 'state',
      bindToController: true,
      scope: {},
      templateUrl: '/mtna/searchbar/searchbar-template.html'
    };
  }

  static selector: string = 'mtnaSearchbar';
  static $inject: string[] = [SearchService.serviceName, '$log'];
  static $depends: string[] = [
    'ngMaterial',
    SearchService.module.name
  ];
  static module: angular.IModule = angular.module(
    'mtna.archive.searchbar', Searchbar.$depends
  ).directive(Searchbar.selector, Searchbar.directive);
}
