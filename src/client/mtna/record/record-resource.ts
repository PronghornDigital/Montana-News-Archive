import {
  IRecord
} from '../../../shared/record/record';

export interface IRecordResource
    extends ng.resource.IResource<IRecord>, IRecord {
 }

export interface RecordResource
  extends ng.resource.IResourceClass<IRecordResource> {
    update(params: any, record: IRecord): ng.IPromise<any>;
}

function recordResourceFactory(
  $resource: ng.resource.IResourceService
): RecordResource {
  return <RecordResource> $resource('/api/records/:id', {id: '@id'}, {
    'update': { method: 'PUT' }
  });
}

export default angular
  .module('mtna.record', ['ngResource'])
  .factory('RecordResource', ['$resource', recordResourceFactory])
  ;
