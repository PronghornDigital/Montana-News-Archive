import { readdir } from 'fs';

import {
  Config,
  Inject,
  RupertPlugin,
  Route,
  Request,
  Response,
  ILogger
} from 'ts-rupert';

@Route.prefix('/api/videos')
export class VideoHandler extends RupertPlugin {
  constructor(
    @Inject(ILogger) public logger: ILogger,
    @Inject(Config) public config: Config
  ) { super(); }

  @Route.GET('/incoming')
  incoming(q: Request, s: Response, n: Function): void {
    let incoming = this.config.find<string>(
      'archive.incoming',
      'ARCHIVE_INCOMING',
      '/var/incoming/'
    );
    readdir(incoming, (err: any, files: string[]) => {
      if ( err ) { return n(err); }
      s.status(200).send(files);
      n();
    });
  }
}

