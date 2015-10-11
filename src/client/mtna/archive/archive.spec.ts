import { expect } from 'chai';

import { Archive } from './archive';

describe('MTNA Archive', function() {
  it('exposes a directive', function() {
    let directive = Archive.directive();
    expect(directive.controller).to.equal(Archive);
  });
});
