export class FileInput {
  static $depends: string[] = [];
  static module: ng.IModule = angular.module(
    'fileInput', FileInput.$depends
  ).directive('fileInput', ['$parse', FileInput.directive]);

  static directive($parse: ng.IParseService): angular.IDirective {
    return {
      restrict: 'E',
      template: `<input type="file" style="display: none"; />
        <md-button ng-click="open($event)">Add Image</md-button>`,
      replace: false,
      scope: false,
      link: { post:  function(
          scope: ng.IScope,
          element: ng.IAugmentedJQuery,
          attrs: ng.IAttributes
      ) {
        let input = <HTMLInputElement>element.find('input')[0];
        let modelGet = $parse(attrs['model']);
        let modelSet = modelGet.assign;
        let onChange = $parse(attrs['onChange']);

        scope['open'] = ($event: any): void => {
          input.click();
        };

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

