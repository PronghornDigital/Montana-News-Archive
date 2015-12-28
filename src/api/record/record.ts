import { writeFile, readFile, stat, Stats, rename } from 'fs';
import { join } from 'path';
import * as mkdirp from 'mkdirp';

import {
  Record,
  RecordDatabase
} from '../../shared/record/record';

import {
  Inject,
  Optional,
  RupertPlugin,
  Route,
  Request,
  Response,
  Methods,
  ILogger
} from 'ts-rupert';

@Route.prefix('/api/records')
export class RecordHandler extends RupertPlugin {
  public basePath: string = join(process.cwd(), 'data');
  public dbPath: string = join(this.basePath, '.db.json');
  private cancelWrite: NodeJS.Timer;

  constructor(
    @Inject(ILogger) public logger: ILogger,
    @Optional()
    @Inject(RecordDatabase)
    private database: RecordDatabase = {}
  ) {
    super();
    readFile(this.dbPath, 'utf-8', (err: any, persisted: string) => {
      if ( err ) {
        this.logger.info(
            `No database found, creating a new one at ${this.dbPath}`
        );
        persisted = '{}';
      }
      let db = JSON.parse(persisted);
      Object.keys(db).forEach((k: any) => {
        if (typeof k === 'string' ) {
          if (Record.isProtoRecord(db[k])) {
            this.database[k] = Record.fromObj(db[k]);
          }
        }
      });
      this.cancelWrite = setInterval(() => this.write(), 1 * 1000);
    });
  }

  write(): void {
    this.logger.verbose(`Writing full database at ${this.dbPath}`);
    writeFile(this.dbPath, JSON.stringify(this.database));
  }

  @Route.GET('/:id')
  get(q: Request, s: Response): void {
    let id: string = q.params['id'];
    if (id in this.database) {
      let record: Record = this.database[id];
      if (!record.deleted) {
        s.status(200).send(record);
        return;
      }
    }
    s.status(404).send(`Record not found: ${id}`);
  }

  @Route.PUT('/:id')
  save(q: Request, s: Response, n: Function): void {
    let id: string = q.params['id'];
    let replaceId: string = q.query && q.query['replaceId'] || null;
    let protoRecord: any = q.body;
    if (Record.isProtoRecord(protoRecord)) {
      let record = Record.fromObj(protoRecord);
      record.id = id;
      if ( replaceId  && replaceId in this.database ) {
        record = this.database[replaceId].merge(record);
        this.moveFiles(replaceId, record.id, (err: any) => {
          if (err !== null) { return n(err); }
          delete this.database[replaceId];
          this.database[record.id] = record;
          return s.status(204).end();
        });
      } else {
        this.database[record.id] = record;
        return s.status(204).end();
      }
    } else {
      return s.status(400).end();
    }
  }

  moveFiles(oldId: string, newId: string, cb: (err: any) => void): void {
    // Assert oldId is present
    let oldPath = join(this.basePath, oldId);
    stat(oldPath, (statErr: any, stats: Stats) => {
      if (statErr !== null) {
        // Probably doesn't exist.
        return cb(null);
      }
      if (!stats.isDirectory()) {
        return cb(null);
      }
      // Move from oldId to newId
      let newPath = join(this.basePath, newId);
      rename(oldPath, newPath, (renameErr: any) => {
        // Return CB
        cb(renameErr);
      });
    });
  }

  static b64image: RegExp = /data:(image)\/([^;]+);base64,(.*)/;

  @Route.POST('/:id/upload')
  upload(q: Request, s: Response, n: Function): void {
    let id: string = q.params['id'];
    let  [_, type, subtype, b64] = RecordHandler.b64image.exec(q.body.image);
    if (_ === null || type !== 'image' ) {
        return n(new Error('Need an image.'));
    }
    let root = join(this.basePath, id);
    mkdirp(root, (mkdirperr: any) => {
      if (mkdirperr !== null) { return n(mkdirperr); }
      let name = id + '_' + ('' + Math.random()).substr(2);
      let path = join(id, name) + '.' + subtype;
      this.logger.debug('Creating ' + path);
      let buffer = new Buffer(b64, 'base64');
      this.logger.debug('Writing ' + buffer.length + ' bytes');
      writeFile(join(this.basePath, path), buffer, (writeerr: any) => {
        if (writeerr !== null) { return n(writeerr); }
        this.logger.debug(`Wrote ${buffer.length} bytes to ${path}`);
        s.status(200).send({path});
      });
    });
  }

  @Route.GET('')
  find(q: Request, s: Response): void {
    s.send(Object.keys(this.database).map((id: string) => {
      return this.database[id];
    }).sort((a: Record, b: Record) => a.label.localeCompare(b.label) ));
  }

  @Route('/:id', {methods: [Methods.DELETE]})
  delete(q: Request, s: Response): void {
    let id: string = q.params['id'];
    if (id in this.database) {
      let record = this.database[id];
      record.deleted = true;
      this.database[record.id] = record;
      s.status(204).end();
      return;
    }
    s.status(404).send(`Record not found: ${id}`);
  }
}
