import {
  expect
} from 'chai';
import {
  SearchService, ISearchQuery
} from './searchbar-service';

const mock = angular.mock;

describe('SearchbarService', () => {
  let sut: SearchService;
  let $httpBackend: ng.IHttpBackendService;

  const apiUrl = '/api/search';

  beforeEach(mock.module(SearchService.module.name));
  beforeEach(mock.inject((
      mtnaSearchService: SearchService,
      _$httpBackend_: ng.IHttpBackendService
  ) => {
    sut = mtnaSearchService;
    $httpBackend = _$httpBackend_;
  }));

  it('should be defined', () => {
    expect(sut).to.exist;
  });

  describe.skip('search', () => {

    it('should call the correct url with the correct parameters', () => {
      $httpBackend.expectGET(`${apiUrl}?query=test-search`).respond(200);
      sut.search({query: 'test-search', before: null, after: null});
      $httpBackend.flush();
    });

    it('should convert the before date to a string', () => {
      const searchParams: ISearchQuery = {
        query: 'test-search',
        before: new Date(),
        after: null
      };
      const beforeDateUTC = encodeURI(searchParams.before.toISOString());
      $httpBackend.expectGET(
        `${apiUrl}?before=${beforeDateUTC}&query=test-search`
      ).respond(200);
      sut.search(searchParams);
      $httpBackend.flush();
    });

    it('should convert the after date to a string', () => {
      const searchParams: ISearchQuery = {
        query: 'test-search',
        before: null,
        after: new Date()
      };
      const afterDateUTC = encodeURI(searchParams.after.toUTCString())
        .replace(/%20/g, '+');
      $httpBackend.expectGET(
        `${apiUrl}?after=${afterDateUTC}&query=test-search`
      ).respond(200);
      sut.search(searchParams);
      $httpBackend.flush();
    });
  });

});
