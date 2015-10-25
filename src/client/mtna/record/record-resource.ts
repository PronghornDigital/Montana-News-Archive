export interface Record extends ng.resource.IResource<Record> {
  label: string;
  family: string;
  medium: string;
  notes?: string;
  // stories?: IStory[];
  deleted?: boolean;
}

export interface RecordResource extends ng.resource.IResourceClass<Record> {

}

function recordResourceFactory(
  $resource: ng.resource.IResourceService
): RecordResource {
  return <RecordResource> $resource('/api/records/:id', {id: '@id'}, {

  });
}

export default angular
  .module('mtna.record', ['ngResource'])
  .factory('RecordResource', ['$resource', recordResourceFactory])
  ;
