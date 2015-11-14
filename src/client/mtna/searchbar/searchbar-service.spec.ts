import {
  expect
} from 'chai';
import {
  SearchService
} from './searchbar-service';

const mock = angular.mock;

describe('SearchbarService', () => {
  let sut: SearchService;
  let $httpBackend: ng.IHttpBackendService;

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

  describe('search', () => {

    it('should call the correct url with the correct parameters', () => {
      $httpBackend.expectGET('/api/search?query=test-search').respond(200);
      sut.search({query: 'test-search'});
      $httpBackend.flush();
    });

  });

});
