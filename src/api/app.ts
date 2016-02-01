import { join, normalize } from 'path';
import { Rupert, Plugins } from 'ts-rupert';

import {
  RecordHandler
} from './record/record';

import{
  VideoHandler
} from './videos/video';

const defaults: any = {
  log: {level: 'info'},
  uploads: { size: '15Mb' },
  static: {
    routes: {
      '/': normalize(join(__dirname, '../_static')),
      '/images/': normalize(join(process.cwd(), 'data'))
    }
  },
  archive: {
    incoming: normalize(join(process.cwd(), '/incoming/'))
  }
};

export const server = Rupert.createApp(defaults, [
  Plugins.Healthz,
  Plugins.Static,
  RecordHandler,
  VideoHandler
]);

if (require.main === module) {
  server.start();
}
