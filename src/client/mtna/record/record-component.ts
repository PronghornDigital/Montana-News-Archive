import {
  Record, Story, Image
} from '../../../shared/record/record';

import { FileReaderService } from '../../util/fileinput/fileinput-service';
import { FileInput } from '../../util/fileinput/fileinput-directive';

export class RecordViewer {
  public record: Record;
  public editing: boolean;
  public selected: boolean;
  public doneEditing: any;

  public newStory: Story = null;
  public image: File = null;

  static $inject: string[] = [FileReaderService.name, '$http', '$scope'];
  constructor(
      private _fileReader: FileReaderService,
      private _http: ng.IHttpService,
      private _scope: ng.IScope
  ) {
    this.resetStory();
  }

  public addStory(story: Story): void {
    this.record.addStories([story]);
    this.resetStory();
  }

  private resetStory(): void {
    this.newStory = new Story('', new Date);
  }

  loadImage() {
    this._fileReader.readAsDataURL(this.image, this._scope)
    .then((result: string) => {
        this.saveImage(result);
    });
  }

  saveImage(image: string) {
    this._http.post(`/api/records/${this.record.id}/upload`, {
      image
    }).then((result: any) => {
     this.image = null;
     this.record.images.push(Image.fromObj(result));
    });
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

  static $depends: string[] = [
    FileReaderService.module.name,
    FileInput.module.name,
  ];
  static module: angular.IModule = angular.module(
    'mtna.recordViewer', RecordViewer.$depends
  ).directive('recordViewer', RecordViewer.directive);
}

