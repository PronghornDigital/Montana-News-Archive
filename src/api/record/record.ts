import { writeFile, readFile, stat, Stats, rename, rmdir, unlink } from 'fs';
import { join } from 'path';
import * as mkdirp from 'mkdirp';

import {
  Image,
  Record,
  RecordDatabase,
  Video
} from '../../shared/record/record';

import {
  Inject,
  Optional,
  RupertPlugin,
  Route,
  Request,
  Response,
  Methods,
  ILogger,
  Config
} from 'ts-rupert';

@Route.prefix('/api/records')
export class RecordHandler extends RupertPlugin {
  public basePath: string = this.config.find<string>(
    'archive.data_root',
    'ARCHIVE_DATA_ROOT',
    '/var/archives'
  );
  public dataPath: string = join(this.basePath, 'data');
  public dbPath: string = join(this.dataPath, '.db.json');
  public incomingPath: string = join(this.basePath, 'incoming');
  private cancelWrite: NodeJS.Timer;

  constructor(
    @Inject(ILogger) public logger: ILogger,
    @Inject(Config) public config: Config,
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
  get(q: Request, s: Response, n: Function): void {
    let id: string = q.params['id'];
    if (id in this.database) {
      let record: Record = this.database[id];
      if (!record.deleted) {
        s.status(200).send(record);
      }
    } else {
      s.status(404).send(`Record not found: ${id}`);
    }
    n();
  }

  @Route.PUT('/:id')
  save(q: Request, s: Response, n: Function): void {
    let id: string = q.params['id'];
    let replaceId: string = q.query && q.query['replaceId'] || null;
    let protoRecord: any = q.body;
    if (Record.isProtoRecord(protoRecord)) {
      let record = Record.fromObj(protoRecord);
      record.forceId(id);
      if ( replaceId !== record.id && record.id in this.database ) {
        s.status(409).send('The label is already used for a different record.');
        return n();
      }
      if ( replaceId  && replaceId in this.database ) {
        record = this.database[replaceId].merge(record);
        this.moveFiles(replaceId, record.id, (err: any) => {
          if (err !== null) { return n(err); }
          delete this.database[replaceId];
          // Update all media links
          record.updateMedia(replaceId);
          this.database[record.id] = record;
          writeFile(
            this.getRecordDBPath(record),
            JSON.stringify(record.toJSON(), null, 2)
          );
          s.status(200).send(record);
          n();
        });
        return;
      } else {
        this.database[record.id] = record;
        mkdirp(join(this.dataPath, record.id), () => {
          writeFile(
            this.getRecordDBPath(record),
            JSON.stringify(record.toJSON(), null, 2)
          );
        });
        s.status(200).send(record);
      }
    } else {
      s.status(400).end();
    }
    n();
  }

  moveFiles(oldId: string, newId: string, cb: (err: any) => void): void {
    // Assert oldId is present
    let oldPath = join(this.dataPath, oldId);
    stat(oldPath, (statErr: any, stats: Stats) => {
      if (statErr !== null) {
        // Probably doesn't exist.
        return cb(null);
      }
      if (!stats.isDirectory()) {
        return cb(null);
      }
      // Move from oldId to newId
      let newPath = join(this.dataPath, newId);
      rename(oldPath, newPath, (renameErr: any) => {
        // Rename the db file
        rename(
          this.getRecordDBPath(<Record>{id: oldId}, newId),
          this.getRecordDBPath(<Record>{id: newId}),
          (dbErr: any) => {
            // Return CB
            cb(renameErr || dbErr);
          }
        );
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
    let root = join(this.dataPath, id);
    mkdirp(root, (mkdirperr: any) => {
      if (mkdirperr !== null) { return n(mkdirperr); }
      let name = id + '_' + ('' + Math.random()).substr(2);
      let path = join(id, name) + '.' + subtype;
      this.logger.debug('Creating ' + path);
      let buffer = new Buffer(b64, 'base64');
      this.logger.debug('Writing ' + buffer.length + ' bytes');
      writeFile(join(this.dataPath, path), buffer, (writeerr: any) => {
        if (writeerr !== null) { return n(writeerr); }
        this.logger.debug(`Wrote ${buffer.length} bytes to ${path}`);
        s.status(200).send({path});
        n();
      });
    });
  }

  @Route.POST('/:id/remove')
  remove(q: Request, s: Response, n: Function): void {
    let path = q.body['path'];
    unlink(join(this.dataPath, path), (err: any) => {
      s.status(204).end();
      n();
    });
  }

  @Route.POST('/:id/associate')
  associate(q: Request, s: Response, n: Function): void {
    let id: string = q.params.id;
    if (!(id in this.database)) {
      s.status(404).send(`Record ${id} not in database.`);
      n();
    } else {
      const record = this.database[id];
      this.moveIncoming(q.body, id).then(() => {
        record.addVideos(
          q.body.map((_: string) => join(id, _))
              .map((_: string) => Video.fromObj({path: _}))
        );
        writeFile(
          this.getRecordDBPath(record),
          JSON.stringify(record.toJSON(), null, 2)
        );
        s.status(200).send(record);
        n();
      }).catch((err: any) => n(err));
    }
  }

  private moveIncoming(paths: string[], id: string): Promise<void[]> {
    let movePath = (path: string) => new Promise<void>((s, j) => {
      let oldPath = join(this.incomingPath, path);
      let newRoot = join(this.dataPath, id);
      let newPath = join(newRoot, path);
      mkdirp(newRoot, (mkdirperr: any) => {
        if (mkdirperr !== null) { return j(mkdirperr); }
        rename(oldPath, newPath, (err: any) => {
          if (err !== null) { return j(err); }
          s();
        });
      });
    });
    return Promise.all(paths.map(movePath));
  }

  @Route.GET('')
  find(q: Request, s: Response, n: Function): void {
    let before = q.query['before'];
    let after = q.query['after'];
    let query = q.query['query'];

    let records = Object.keys(this.database).map((id: string) => {
      return this.database[id];
    });
    if (query) {
      const searchString = query.toLowerCase();
      records = records.filter((a: Record) => {
        let found = false;
        ['label', 'family', 'notes'].forEach((k) => {
          const sourceString = (<any>a)[k].toLowerCase();
          found = found || (sourceString.indexOf(searchString) > -1);
        });
        if (!found) {
          const l = a.stories.length;
          any: for (let i = 0 ; i < l; i++) {
            if (a.stories[i].slug.toLowerCase().indexOf(searchString) > -1) {
              found = true;
              break any;
            }
          }
        }
        return found;
      });
    }
    if (before) {
      before = new Date(before);
      records = records.filter((a: Record) => a.first <= before);
    }
    if (after) {
      after = new Date(after);
      records = records.filter((a: Record) => a.last >= after);
    }
    s.status(200).send(
        records.sort((a: Record, b: Record) => a.label.localeCompare(b.label))
    );
    n();
  }

  @Route('/:id', {methods: [Methods.DELETE]})
  delete(q: Request, s: Response, n: Function): void {
    let id: string = q.params['id'];
    let record = this.database[id];
    Promise.all<void|void[]>([
      this.returnToIncoming(record.videos || []),
      this.removeImages(record.images || []),
      this.removeData(record),
    ]).then(() => {
      return new Promise<void>((r, j) => {
        rmdir(join(this.dataPath, id), (err: any) => {
          if (err !== null && err.code !== 'ENOENT') { return j(err); }
          r();
        });
      });
    }).then(() => {
      this.database[record.id] = null;
      delete this.database[record.id];
      s.status(204).end();
    }).catch((e) => {
      s.status(500).send(e);
    });
  }

  private getParts(path: string): {name: string, ext: string} {
    let file = path.split('/')[1];
    let [name, ext] = file.split('.');
    return {name, ext};
  }

  private returnToIncoming(videos: Video[]): Promise<void[]> {
    const timestamp = new Date().toISOString();
    const moveVideo = (video: Video) => new Promise<void>((s, j) => {
      let currentPath = join(this.dataPath, video.path);
      let {name, ext} = this.getParts(video.path);
      let incomingPath = join(this.incomingPath, `${name}_recovered_${timestamp}.${ext}`);
      rename(currentPath, incomingPath, (err: any) => {
        if (err !== null) { return j(err); }
        s();
      });
    });
    return Promise.all(videos.map(moveVideo));
  }

  private removeImages(images: Image[]): Promise<void[]> {
    const deleteImage = (image: Image) => new Promise<void>((s, j) => {
      unlink(join(this.dataPath, image.path), (err: any) => {
        if (err !== null) { return j(err); }
        s();
      });
    });
    return Promise.all(images.map(deleteImage));
  }

  private removeData(record: Record): Promise<void> {
    return new Promise<void>((s, j) => {
      unlink(this.getRecordDBPath(record), (err: any) => {
        if (err !== null) { return j(err); }
        s();
      });
    });
  }

  private getRecordDBPath(record: Record, oldId = record.id): string {
    return join(this.dataPath, oldId, `${record.id}.json`);
  }
}
