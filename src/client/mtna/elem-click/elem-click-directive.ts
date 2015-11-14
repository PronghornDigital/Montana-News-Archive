export class ElemClick {
  static directive(): angular.IDirective {
    return {
      restrict: 'A',
      scope: {
        clickHandler: `&${ElemClick.selector}`
      },
      link: function(scope: angular.IScope, element: angular.IAugmentedJQuery) {
        element.on('click', function(event) {
          if (event.target !== element[0]) {
            return;
          }
          scope.$apply(function() {
            (<any>scope).clickHandler();
          });
        });
      }
    };
  }

  static selector: string = 'elemClick';
  static $depends: string[] = [];

  static module: angular.IModule = angular.module(
    'mtna.elem-click', ElemClick.$depends
  ).directive(ElemClick.selector, ElemClick.directive);
}
