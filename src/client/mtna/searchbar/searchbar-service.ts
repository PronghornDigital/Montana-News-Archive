export interface ISearchQuery {
  query: string;
  before: Date;
  after: Date;
}

interface ISearchParams {
  query: string;
  before: string;
  after: string;
}

class SearchQuery implements ISearchQuery {
  public query: string = '';
  public before: Date = null;
  public after: Date = null;

  constructor(
    sq: ISearchQuery
  ) {
    this.query = sq.query;
    this.before = sq.before;
    this.after = sq.after;
  }
  toJSON(): ISearchParams {
    return {
      query: this.query,
      before: this.before ? this.before.toUTCString() : null,
      after: this.after ? this.after.toUTCString() : null,
    };
  }
}

export const SEARCH_EVENT = 'mtnaSearchService NewSearch';

export class SearchService {

  constructor(private _scope: angular.IScope) {
  }

  search(sq: ISearchQuery): void {
    const searchQuery = new SearchQuery(sq);
    this._scope.$broadcast(SEARCH_EVENT, searchQuery);
  }

  static serviceName: string = 'mtnaSearchService';

  static $inject: string[] = ['$rootScope'];
  static $depends: string[] = [];

  static module: angular.IModule = angular.module(
      'mtna.archive.searchservice', SearchService.$depends
      ).service(SearchService.serviceName, SearchService);
}
