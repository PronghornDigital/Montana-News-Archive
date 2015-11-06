import {
  expect
} from 'chai';

import {
  Record,
  RecordResource
} from './record/record-resource';

import {
  MOCK_RECORD_1,
  MOCK_RECORD_2,
  MOCK_RECORD_3
} from '../../shared/record/record.mock';

import {
  Archive
} from './archive-component';

let $rootScope: ng.IScope = null;
let $q: ng.IQService = null;

class MockRecordResource {
  [key: string]: any;
  constructor(record: any) {
    Object.keys(record).forEach((k: string) => this[k] = record[k]);
  }

  $save() { return $q.resolve(); }

  static query(): {$promise: Thenable<Record[]>} {
    return {$promise: $q.resolve([<Record><any>MOCK_RECORD_1])};
  }
}

describe('MTNA Archive', function() {
  beforeEach(inject(function(_$q_: ng.IQService, _$rootScope_: ng.IScope){
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  it('exposes a directive', function() {
    let directive = Archive.directive();
    expect(directive.controller).to.equal(Archive);
  });

  it('can add a tape', function() {
    let archive = new Archive($q, <RecordResource><any>MockRecordResource);
    expect(archive.records.length).to.equal(0);
    archive.addTape();
    expect(archive.records.length).to.equal(1);
    expect(archive.editing).to.equal(archive.records[0]);
  });

  describe('edit mode', function() {
    it('transitions between editing and non-editing', function() {
      let archive = new Archive($q, <RecordResource><any>MockRecordResource);
      let record = new MockRecordResource(MOCK_RECORD_1);
      archive.edit(<Record><any>record);
      expect(archive.editing).to.equal(record);
      expect(archive.saving).to.be.false;
      archive.edit(null);
      expect(archive.saving).to.be.true;
      $rootScope.$apply();
      expect(archive.saving).to.be.false;
    });

    it('saves when transitioning from one edit to another', function() {
      let archive = new Archive($q, <RecordResource><any>MockRecordResource);
      let record1 = new MockRecordResource(MOCK_RECORD_1);
      let record2 = new MockRecordResource(MOCK_RECORD_2);
      archive.edit(<Record><any>record1);
      expect(archive.editing).to.equal(record1);
      expect(archive.saving).to.be.false;
      archive.edit(<Record><any>record2);
      // Stay on record1 until the save finishes.
      // If the save errors, then the old data isn't erased.
      expect(archive.editing).to.equal(record1);
      expect(archive.saving).to.be.true;
      $rootScope.$apply();
      expect(archive.editing).to.equal(record2);
      expect(archive.saving).to.be.false;
    });
  });
  describe('selection', function() {
    it('changes pre/current/post lists', function() {
      let archive = new Archive($q, <RecordResource><any>MockRecordResource);
      let record1: Record = <Record><any> new MockRecordResource(MOCK_RECORD_1);
      let record2: Record = <Record><any> new MockRecordResource(MOCK_RECORD_2);
      let record3: Record = <Record><any> new MockRecordResource(MOCK_RECORD_3);
      archive.records = [record1, record2, record3];
      archive.select(null);
      expect(archive.pre.length).to.equal(3);
      expect(archive.current).to.equal(null);
      expect(archive.post.length).to.equal(0);
      archive.select(record1);
      expect(archive.pre.length).to.equal(0);
      expect(archive.current).to.equal(record1);
      expect(archive.post.length).to.equal(2);
      archive.select(null);
      expect(archive.pre.length).to.equal(3);
      expect(archive.current).to.equal(null);
      expect(archive.post.length).to.equal(0);
      archive.select(record2);
      expect(archive.pre.length).to.equal(1);
      expect(archive.current).to.equal(record2);
      expect(archive.post.length).to.equal(1);
      archive.select(null);
      expect(archive.pre.length).to.equal(3);
      expect(archive.current).to.equal(null);
      expect(archive.post.length).to.equal(0);
      archive.select(record3);
      expect(archive.pre.length).to.equal(2);
      expect(archive.current).to.equal(record3);
      expect(archive.post.length).to.equal(0);
      archive.select(null);
      expect(archive.pre.length).to.equal(3);
      expect(archive.current).to.equal(null);
      expect(archive.post.length).to.equal(0);
    });
  });
});

