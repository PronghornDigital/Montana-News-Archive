import {
  Record, Story, Image
} from '../../../shared/record/record';
import { Associate  } from './associate/associate-component';

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

  public updateRecord(updatedRecordData: any) {
    this.record.merge(updatedRecordData);
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
     this.record.images.push(Image.fromObj(result.data));
    });
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
              input.focus();
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

