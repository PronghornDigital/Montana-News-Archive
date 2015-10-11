import {
  join,
  normalize
} from 'path';

import {
  // Inject,
  Rupert,
  // RupertPlugin,
  // Config,
  // ILogger,

  // Route, Methods,
  // Request, Response, Next,

  Plugins
} from 'ts-rupert';

const defaults: any = {
  log: {level: 'info'},
  static: {
    routes: {
      '/': normalize(join(__dirname, '../')),
    }
  }
};
export const server = Rupert.createApp(defaults, [
  Plugins.Healthz,
  Plugins.Static
]);

if (require.main === module) {
  server.start();
}
