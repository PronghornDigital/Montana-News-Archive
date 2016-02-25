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
      '/images/': normalize(
          // TODO If and when Rupert gets referential configs, set that here.
          join(process.env['ARCHIVE_DATA_ROOT'] || process.cwd(), 'data'))
    }
  },
  archive: {
    data_root: normalize(process.cwd())
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
