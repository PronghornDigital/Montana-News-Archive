import {
  SearchService, ISearchQuery
} from './searchbar-service';

import {
  LocationService
} from '../location/location-service';

export class Searchbar {
  public searching: boolean = false;
  public searchString: string = '';
  public after: Date;
  public before: Date;

  static $inject: string[] = [SearchService.serviceName, '$log', LocationService.serviceName];
  constructor(
      private _searchService: SearchService,
      private _$log: ng.ILogService,
      _location: LocationService
  ) {
    this.searchString = _location.queryString;
    this.after = _location.startDate;
    this.before = _location.endDate;
  }

  search() {
    const searchQuery: ISearchQuery = {
      query: this.searchString,
      before: this.before,
      after: this.after
    };
    this._searchService.search(searchQuery);
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
  static $depends: string[] = [
    'ngMaterial',
    SearchService.module.name,
    LocationService.module.name
  ];
  static module: angular.IModule = angular.module(
    'mtna.archive.searchbar', Searchbar.$depends
  ).directive(Searchbar.selector, Searchbar.directive);
}
