import {
  Record, Story
} from '../../../shared/record/record';

export class RecordViewer {
  public record: Record;
  public editing: boolean;
  public selected: boolean;
  public doneEditing: any;

  public newStory: Story = null;

  constructor() {
    this.resetStory();
  }

  public addStory(story: Story): void {
    this.record.addStories([story]);
    this.resetStory();
  }

  private resetStory(): void {
    this.newStory = new Story('', new Date);
  }

  static directive(): angular.IDirective {
    return {
      controller: RecordViewer,
      controllerAs: 'state',
      bindToController: true,
      scope: {
        record: '=',
        selected: '=',
        doneEditing: '&'
      },
      templateUrl: '/mtna/record/record-template.html'
    };
  }

  static $inject: string[] = [];
  static $depends: string[] = [];
  static module: angular.IModule = angular.module(
    'mtna.recordViewer', RecordViewer.$depends
  ).directive('recordViewer', RecordViewer.directive);
}
