import { expect } from 'chai';

import { Record, RecordResource } from '../record/record-resource';
import { Archive } from './archive';

class MockRecordResource {
  [key: string]: any;
  constructor(record: Record) {
    Object.keys(record).forEach((k: string) => this[k] = record[k]);
  }

  static query(): {$promise: Thenable<Record[]>} {
    return {$promise: Promise.resolve()};
  }
}

describe('MTNA Archive', function() {
  it('exposes a directive', function() {
    let directive = Archive.directive();
    expect(directive.controller).to.equal(Archive);
  });

  it('can add a tape', function() {
    let archive = new Archive(<RecordResource><any>MockRecordResource);
    expect(archive.records.length).to.equal(0);
    archive.addTape();
    expect(archive.records.length).to.equal(1);
  });
});
