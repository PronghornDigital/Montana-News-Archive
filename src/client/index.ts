import {
  Archive
} from './mtna/archive/archive';

angular.module('mtna', [
  'mtna.templates',
  Archive.module.name
]);
