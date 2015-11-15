import { writeFile, readFile } from 'fs';
import { join } from 'path';
import * as Busboy from 'busboy';

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
  public dbPath: string = join(process.cwd(), '.db.json');
  private cancelWrite: NodeJS.Timer;

  constructor(
    @Inject(ILogger) logger: ILogger,
    @Optional()
    @Inject(RecordDatabase)
    private database: RecordDatabase = {}
  ) {
    super();
    readFile(this.dbPath, 'utf-8', (err: any, persisted: string) => {
      if ( err ) {
        logger.info(`No database found, creating a new one at ${this.dbPath}`);
        return;
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
  save(q: Request, s: Response): void {
    let id: string = q.params['id'];
    let replaceId: string = q.query && q.query['replaceId'] || null;
    let protoRecord: any = q.body;
    if (Record.isProtoRecord(protoRecord)) {
      let record = Record.fromObj(protoRecord);
      record.id = id;
      if ( replaceId  && replaceId in this.database ) {
        record = this.database[replaceId].merge(record);
        delete this.database[replaceId];
      }
      this.database[record.id] = record;
      return s.status(204).end();
    } else {
      return s.status(400).end();
    }
  }

  @Route.GET('')
  find(q: Request, s: Response): void {
    s.send(Object.keys(this.database).map((id: string) => {
      return this.database[id];
    }));
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

  @Route.POST('/upload')
  upload(q: Request, s: Response): void {
    let busboy = new Busboy({ headers: q.headers });
    busboy.on('file', (
      fieldname: any,
      file: any,
      filename: any,
      encoding: any,
      mimetype: any
    ) => {
      console.log('File [' + fieldname + ']: filename: ' + filename);
      console.log('encoding: ' + encoding + ', mimetype: ' + mimetype);
      file.on('data', (data: any) => {
        console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      });
      file.on('end', () => {
        console.log('File [' + fieldname + '] Finished');
      });
    });
    busboy.on('field', (
      fieldname: any,
      val: any,
      fieldnameTruncated: any,
      valTruncated: any
    ) => {
      console.log('Field [' + fieldname + ']: value: ' + val);
    });
    busboy.on('finish', () => {
      console.log('Done parsing form!');
      s.writeHead(303, { Connection: 'close', Location: '/' });
      s.end();
    });
    q.pipe(busboy);
  }
}
