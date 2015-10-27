import {
  Story
} from '../../../shared/record/record';

export interface Record extends ng.resource.IResource<Record> {
  id?: string;
  label: string;
  family: string;
  medium: string;
  notes?: string;
  stories?: Story[];
  deleted?: boolean;
}

export interface RecordResource extends ng.resource.IResourceClass<Record> {
}

function recordResourceFactory(
  $resource: ng.resource.IResourceService
): RecordResource {
  return <RecordResource> $resource('/api/records/:id', {id: '@id'}, {
    'save': { method: 'PUT', isArray: false}
  });
}

export default angular
  .module('mtna.record', ['ngResource'])
  .factory('RecordResource', ['$resource', recordResourceFactory])
  ;
