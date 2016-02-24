import { expect, use as chaiUse } from 'chai';
import * as sinon from 'sinon';

import { MOCK_RECORD_1 } from '../../shared/record/record.mock';

/* tslint:disable */
chaiUse(require('sinon-chai'));
let mockfs = require('mock-fs');
let fs = require('fs')
/* tslint:enable */

import {
  Request, Response, Config
} from 'ts-rupert';

import { getMockLogger } from '../../util/mockLogger';

import {
  Record,
  RecordDatabase
} from '../../shared/record/record';

import {
  RecordHandler
} from './record';

describe('Record Handler', function() {
  let recordMap: RecordDatabase;
  let handler: RecordHandler;

  beforeEach(function() {
    recordMap = {};
    handler = new RecordHandler(getMockLogger(), new Config(), recordMap);
    mockfs({ './data/.db.json': '{}' });
  });

  afterEach(function() {
    mockfs.restore();
  });

  describe('Saving', function() {
    it('saves', function(done: Function) {
      let q: Request = <Request><any>{
        params: {
          id: 'clip-1'
        },
        body: {
          label: 'Tape 1',
          family: 'Tapes',
          medium: '3/4"',
          stories: [ {
            slug: 'Story 1',
            date: new Date('10/15/2015'),
            format: 'VO',
            runtime: '5:30'
          } ]
        }
      };
      let s: Response = <Response><any>{
        status: function(status: number): Response {
          return this;
        },
        end: sinon.spy()
      };
      let statusSpy = sinon.spy(s, 'status');
      handler.save(q, s,  (err: any) => {
        try {
          expect(err).to.not.exist;
          expect(statusSpy).to.have.been.calledWithExactly(204);
          expect('tape_1' in recordMap).to.be.true;
          let record = recordMap['tape_1'];
          expect(record.stories.length).to.equal(1);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('replaces tapes with old ids', function(done: Function) {
      recordMap['klip_1'] = new Record('Klip 1', 'tapes');
      let q: Request = <Request><any>{
        params: {
          id: 'tape-1'
        },
        query: {
          replaceId: 'klip_1'
        },
        body: {
          label: 'Tape 1',
          family: 'Tapes',
          medium: '3/4"',
          stories: [ {
            slug: 'Story 1',
            date: new Date('10/15/2015'),
            format: 'VO',
            runtime: '5:30'
          } ]
        }
      };
      let s: Response = <Response><any>{
        status: function(status: number): Response {
          return this;
        },
        end: sinon.spy()
      };
      let statusSpy = sinon.spy(s, 'status');
      handler.save(q, s, (err: any) => {
        try {
          expect(err).to.not.exist;
          expect(statusSpy).to.have.been.calledWithExactly(204);
          expect(Object.keys(recordMap)).to.deep.equal(['tape_1']);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('replaces missing tapes', function(done: Function) {
      let q: Request = <Request><any>{
        params: {
          id: 'tape-1'
        },
        query: {
          replaceId: 'klip_1'
        },
        body: {
          label: 'Tape 1',
          family: 'Tapes',
          medium: '3/4"',
          stories: [ {
            slug: 'Story 1',
            date: new Date('10/15/2015'),
            format: 'VO',
            runtime: '5:30'
          } ]
        }
      };
      let s: Response = <Response><any>{
        status: function(status: number): Response {
          return this;
        },
        end: sinon.spy()
      };
      let statusSpy = sinon.spy(s, 'status');
      handler.save(q, s, (err: any) => {
        try {
          expect(err).to.not.exist;
          expect(statusSpy).to.have.been.calledWithExactly(204);
          expect(Object.keys(recordMap)).to.deep.equal(['tape_1']);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe('Associate', function() {
    beforeEach(function() {
      recordMap['tape-1'] = Record.fromObj(MOCK_RECORD_1);
      let associateFs = {
        '/var/incoming': {'path1': 'Video 1', 'path2': 'Video 2'},
        './data/.db.json': '{}'
      };
      associateFs[handler.basePath + '/tape-1'] = {};
      mockfs(associateFs);
    });
    it('associates videos with records', function(done: Function) {
      let renameSpy = sinon.spy(fs, 'rename');
      let q: Request = <Request><any>{
        params: { id: 'tape-1' },
        body: ['path1', 'path2']
      };
      let s: Response = <Response><any>{
        status: function(status: number): Response {
          return this;
        },
        send: sinon.spy()
      };
      let statusSpy = sinon.spy(s, 'status');
      handler.associate(q, s, (err: any) => {
        try {
          expect(err).to.not.exist;
          expect(renameSpy).to.have.been.calledTwice;
          let videoPaths = recordMap['tape-1'].videos.map((_) => _.path);
          expect(videoPaths).to.deep.equal(['tape-1/path1', 'tape-1/path2']);
          expect(statusSpy).to.have.been.calledWith(200);
          // expect(s.send).to.have.been.called.with(MOCK_RECORD_1);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});

