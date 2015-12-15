export class FileInput {
  static $depends: string[] = [];
  static module: ng.IModule = angular.module(
    'fileInput', FileInput.$depends
  ).directive('fileInput', ['$parse', FileInput.directive]);

  static directive($parse: ng.IParseService): angular.IDirective {
    return {
      restrict: 'EA',
      template: `<input type="file" />`,
      replace: false,
      scope: false,
      link: { post:  function(
          scope: ng.IScope,
          element: ng.IAugmentedJQuery,
          attrs: ng.IAttributes
      ) {
        let input = <HTMLInputElement>element[0];
        let modelGet = $parse(attrs['fileInput']);
        let modelSet = modelGet.assign;
        let onChange = $parse(attrs['onChange']);

        element.bind('change', (event: any) => {
          scope.$apply(() => {
            modelSet(scope, event.target.files[0]);
            onChange(scope);
          });
        });

        scope.$watch(modelGet, (newVal: any) => {
          if (!newVal) {
            input.value = '';
          }
        });
      }}
    };
  }
}

