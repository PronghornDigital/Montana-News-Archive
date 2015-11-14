import {
  Archive
} from './mtna/archive-component';

angular.module('mtna', [
  'mtna.templates',
  Archive.module.name
]).config( ($sceDelegateProvider: any) => {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our video assets domain.
    // TODO: Put CDN domain here. These are just for dev.
    'http://stanparker.net/**',
    'http://www.w3schools.com/**'
  ]);
});
