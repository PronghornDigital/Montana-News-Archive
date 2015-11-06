import {
  Story as StoryModel
} from '../../../shared/record/record';

export class Story {
  public story: StoryModel = null;
  static directive(): angular.IDirective {
    return {
      controller: Story,
      controllerAs: 'state',
      bindToController: true,
      scope: {
        story: '='
      },
      templateUrl: '/mtna/archive/story/story-template.html'
    };
  }

  static selector: string = 'story';
  static $inject: string[] = [];
  static $depends: string[] = [
    'ngMaterial'
  ];
  static module: angular.IModule = angular.module(
    'mtna.archive.story', Story.$depends
  ).directive(Story.selector, Story.directive);
}
