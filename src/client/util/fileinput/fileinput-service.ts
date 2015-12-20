export class FileReaderService {
  static name: string = 'FileReader';
  static $inject: string[] = ['$q'];
  constructor(private _q: ng.IQService) {}
  static $depends: string[] = [];
  static module: angular.IModule = angular.module(
    'util.FileReaderService', FileReaderService.$depends
  ).service(FileReaderService.name, ['$q', FileReaderService]);

  readAsText(file: Blob|File, scope: ng.IScope) {
    let deferred = this._q.defer();
    let reader = getReader(deferred, scope);
    reader.readAsText(file);
    return deferred.promise;
  };
  readAsArrayBuffer(file: Blob|File, scope: ng.IScope) {
    let deferred = this._q.defer();
    let reader = getReader(deferred, scope);
    reader.readAsArrayBuffer(file);
    return deferred.promise;
  };
  readAsDataURL(file: Blob|File, scope: ng.IScope) {
    let deferred = this._q.defer();
    let reader = getReader(deferred, scope);
    reader.readAsDataURL(file);
    return deferred.promise;
  };
}

function getReader(deferred: ng.IDeferred<any>, scope: ng.IScope) {
  let reader = new FileReader();
  reader.onload = onLoad(reader, deferred.resolve, scope);
  reader.onerror = onError(reader, deferred.reject, scope);
  reader.onprogress = onProgress(scope);
  return reader;
};

function onLoad(
  r: FileReader, resolve: (a: any) => void, scope: ng.IScope
): (ev: Event) => any {
  return function() {
    scope.$apply(function() {
      resolve(r.result);
    });
  };
 };

function onError(
  r: FileReader, reject: (a: any) => void, scope: ng.IScope
): (ev: Event) => any {
  return function() {
    scope.$apply(function() {
      reject(r.result);
    });
  };
};

function onProgress(scope: ng.IScope): (ev: ProgressEvent) => any {
  return function(event: {total: any, loaded: any}) {
    scope.$broadcast('fileProgress', {
      total: event.total,
      loaded: event.loaded
    });
  };
};

