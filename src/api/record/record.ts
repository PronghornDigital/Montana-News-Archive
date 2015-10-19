import {
  Record,
  // RecordClip,
  RecordDatabase
} from '../../shared/record/record';

import {
  Inject,
  RupertPlugin,
  Route,
  Request,
  Response
} from 'ts-rupert';

@Route.prefix('/api/records')
export class RecordHandler extends RupertPlugin {
  constructor(
    @Inject(RecordDatabase)
    private database: RecordDatabase = new RecordDatabase()
  ) {
    super();
  }

  @Route.GET('/:id')
  get(q: Request, s: Response): void {
    let id: string = q.params['id'];
    if (this.database.has(id)) {
      let record: Record = this.database.get(id);
      if (!record.deleted) {
        s.status(200).send(this.database.get(id));
        return;
      }
    }
    s.status(404).send(`Record not found: ${id}`);
  }

  @Route.PUT('/:id')
  save(q: Request, s: Response): void {
    let id: string = q.params['id'];
    let protoRecord: any = q.body;
    if (Record.isProtoRecord(protoRecord)) {
      let record = Record.fromObj(protoRecord);
      if (this.database.has(record.id)) {
        record.merge(this.database.get(record.id));
      }
      record.id = id;
      this.database.set(record.id, record);
      return s.status(204).end();
    } else {
      return s.status(400).end();
    }
  }

  // @Route.GET('')
  // find(q: Request, s: Response): void {
  //
  // }

  @Route.DELETE('/:id')
  delete(q: Request, s: Response): void {
    let id: string = q.params['id'];
    if (this.database.has(id)) {
      let record = this.database.get(id);
      record.deleted = true;
      this.database.set(record.id, record);
      s.status(204).end();
      return;
    }
    s.status(404).send(`Record not found: ${id}`);
  }
}
