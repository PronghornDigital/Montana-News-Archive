import { expect, use as chaiUse } from 'chai';
import * as sinon from 'sinon';
/* tslint:disable */
chaiUse(require('sinon-chai'));
/* tslint:enable */

import {
  Request, Response
} from 'express';

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
    handler = new RecordHandler(getMockLogger(), recordMap);
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
        expect(err).to.not.exist;
        expect(statusSpy).to.have.been.calledWithExactly(204);
        expect('tape_1' in recordMap).to.be.true;
        let record = recordMap['tape_1'];
        expect(record.stories.length).to.equal(1);
        done();
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
        expect(err).to.not.exist;
        expect(statusSpy).to.have.been.calledWithExactly(204);
        expect(Object.keys(recordMap)).to.deep.equal(['tape_1']);
        done();
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
        expect(err).to.not.exist;
        expect(statusSpy).to.have.been.calledWithExactly(204);
        expect(Object.keys(recordMap)).to.deep.equal(['tape_1']);
        done();
      });
    });
  });

  describe('Associate', function() {
    it('associates videos with records', function(done: Function) {
      // TODO THINK ABOUT THIS
      let q: Request = <Request><any>{
        body: ['path1', 'path2']
      };
      let s: Response = <Response><any>{
      };
      handler.associate(q, s, (err: any) => {
      // rename incoming/path1 record/path1
      // rename incoming/path2 record/path2
      // record[recordid].videos.append([record/path1, record/path2].map(Video))
        expect(err).to.not.exist;
        done();
      });
    });
  });
});

