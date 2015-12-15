import { join, normalize } from 'path';
import { Rupert, Plugins } from 'ts-rupert';

import {
  RecordHandler
} from './record/record';

const defaults: any = {
  log: {level: 'info'},
  uploads: { size: '15Mb' },
  static: {
    routes: {
      '/': normalize(join(__dirname, '../_static')),
    }
  }
};

export const server = Rupert.createApp(defaults, [
  Plugins.Healthz,
  Plugins.Static,
  RecordHandler
]);

if (require.main === module) {
  server.start();
}
