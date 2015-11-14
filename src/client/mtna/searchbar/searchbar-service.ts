export interface ISearchQuery {
  query: string;
}

export class SearchService {

  constructor(private _http: angular.IHttpService) {
  }

  search(searchQuery: ISearchQuery): angular.IPromise<any> {
    return this._http({
      url: '/api/search',
      method: 'GET',
      params: searchQuery
    });
  }

  static serviceName: string = 'mtnaSearchService';

  static $inject: string[] = ['$http'];
  static $depends: string[] = [];

  static module: angular.IModule = angular.module(
      'mtna.archive.searchservice', SearchService.$depends
      ).service(SearchService.serviceName, SearchService);
}
