export class SetFocus {
  static $depends: string[] = [];
  static module: ng.IModule = angular.module(
    'SetFocus', SetFocus.$depends
  ).directive('setFocus', ['$parse', SetFocus.directive]);

  static directive($parse: ng.IParseService): angular.IDirective {
    return {
      restrict: 'A',
      replace: false,
      scope: false,
      link: { post:  function(
          scope: ng.IScope,
          $element: ng.IAugmentedJQuery,
          attrs: ng.IAttributes
      ) {
        let element = <HTMLInputElement>$element[0];
        let setFocus = $parse(attrs['setFocus']);

        scope.$watch(setFocus, (newVal: any, oldVal: any) => {
          if (!!newVal) {
            element.focus();
          }
        });
      }}
    };
  }
}

