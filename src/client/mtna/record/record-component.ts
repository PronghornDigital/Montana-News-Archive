import {
  Record, Story, Image, Video
} from '../../../shared/record/record';
import { Associate  } from './associate/associate-component';
import { Archive } from '../archive-component';

import { FileReaderService } from '../../util/fileinput/fileinput-service';
import { FileInput } from '../../util/fileinput/fileinput-directive';

export class RecordViewer {
  public record: Record;
  public archive: Archive;
  public editing: boolean;
  private editingStory: Story = null;
  public selected: boolean;
  public doneEditing: any;

  public newStory: Story = null;
  public image: File = null;

  static $inject: string[] = [FileReaderService.serviceName, '$http', '$scope'];
  constructor(
      private _fileReader: FileReaderService,
      private _http: ng.IHttpService,
      private _scope: ng.IScope
  ) { }

  updateRecord({updatedRecordData}) {
    this.record.merge(updatedRecordData);
  }

  addStory(): void {
    const newStory = new Story('', new Date);
    this.record.addStories([newStory]);
    this.toggleEditing(newStory);
  }

  removeStory(story: Story): void {
    this.record.removeStory(story);
    this.doneEditing();
  }

  toggleEditing(story: Story): void {
    if (this.editingStory != null) {
      // Were editing something, not anymore!
      this.doneEditing();
    }
    if (this.editingStory === story) {
      this.editingStory = null;
    } else {
      this.editingStory = story;
    }
  }

  isEditing(story: Story): boolean {
    return this.editingStory === story;
  }

  done() {
    if (this.editing) {
      this.doneEditing().then(() => {
        this.editing = false;
      });
    }
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
     this.record.images.push(Image.fromObj(result.data));
    });
  }

  safeVideoUrl(video: Video): string {
    return '/images/' + video.path;
  }

  static directive($timeout: ng.ITimeoutService): angular.IDirective {
    return {
      controller: RecordViewer,
      controllerAs: 'state',
      bindToController: true,
      scope: {
        record: '=',
        selected: '=',
        doneEditing: '&'
      },
      templateUrl: '/mtna/record/record-template.html',
      link: {
        post: function($scope: ng.IScope, $element: JQuery) {
          if ($scope['state'].record.isNewTape === true) {
            $scope['state'].record.isNewTape = false;
            $scope['state'].editing = true;
          }
          if ($scope['state'].selected) {
            $timeout(function() {
              let input: HTMLInputElement = <HTMLInputElement>$element[0]
                  .querySelector('[ng-model="state.record.label"]');
              if (input) {
                input.focus();
              }
            }); // two frames
          }
        }
      }
    };
  }

  static $depends: string[] = [
    FileReaderService.module.name,
    FileInput.module.name,
    Associate.module.name,
  ];
  static module: angular.IModule = angular.module(
    'mtna.recordViewer', RecordViewer.$depends
  ).directive('recordViewer', ['$timeout', RecordViewer.directive]);
}

