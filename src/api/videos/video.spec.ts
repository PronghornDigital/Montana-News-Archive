import { expect, use as chaiUse } from 'chai';
import * as sinon from 'sinon';

/* tslint:disable */
chaiUse(require('sinon-chai'));
let mock: any = require('mock-fs');
/* tslint:enable */

import {
  Request, Response, Config, ILogger
} from 'ts-rupert';

import { getMockLogger } from '../../util/mockLogger';

import { VideoHandler } from './video';
import { mockIncoming } from './video.mock';

describe('VideoHandler', function() {
  let handler: VideoHandler = null;
  let config: Config = null;
  let logger: ILogger = null;

  beforeEach(function() {
    config = new Config({archive: { incoming: '/var/incoming/' }});
    let files = {};
    mockIncoming.forEach((_) => files[_] = `Video ${_}`);
    mock({'/var/incoming/': files, './data/.db.json': '{}'});
    logger = getMockLogger();
    handler = new VideoHandler(logger, config);
  });

  afterEach(function() {
    mock.restore();
  });

  describe('Incoming', function() {
    it('returns a list of videos in the incoming directoy.', function(done: Function) {
      let q = <Request><any>{ };
      let s: Response = <Response><any>{
        status: function(status: number): Response {
          return this;
        },
        send: sinon.spy()
      };
      let statusSpy = sinon.spy(s, 'status');

      handler.incoming(q, s, (err: any) => {
        expect(err).to.not.exist;
        expect(statusSpy).to.have.been.calledWith(200);
        expect(s.send).to.have.been.calledWith(mockIncoming);
        done();
      });
    });
  });
});
