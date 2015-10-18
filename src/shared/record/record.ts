export class RecordDatabase extends Map<string, Record> {}

export interface IRecord {
  id: string,
  label: string,
  category: string,
  notes?: string,
  clips?: IRecordClip[],
  deleted?: boolean,
}

export interface IRecordClip {
  slug: string,
  date: string|Date,
  format: string,
  runtime: string
}

export class Record {
  private _first: Date;
  private _last: Date;
  private _clips: RecordClip[];

  constructor(
    public id: string,
    public label: string,
    public category: string,
    public notes: string = "",
    public deleted: boolean = false,
    clips: RecordClip[] = []
  ) {
    this.addClips(clips);
  }

  get first(): Date { return this._first; }
  get last(): Date { return this._last; }
  get clips(): RecordClip[] { return this._clips; }

  addClips(clips: RecordClip[]): Record {
    this.clips = this.clips.concat(clips).sort(RecordClip.compare);
    this._first = this.clips[0].date;
    this._last = this.clips[this.clips.length - 1].date;
    return this;
  }

  /**
   * Merges the contents of the specified Record into current Record.
   *
   * This method merges the contents of the specified Record into the current
   * Record. Fields that are set in the specified record overwrite
   * the corresponding fields in the current record. RecordClips are
   * appended. Record date ranges are expanded.
   */
  merge(other: Record): Record {
    this.id = other.id || this.id;
    this.label = other.label || this.label;
    this.category = other.category || this.category;
    this.notes = other.notes || this.notes;
    this.addClips(other.clips);
    return this;
  }

  static fromObj(obj: any): Record {
    let {id, label, category, notes, deleted = false} = obj;
    let record = new Record(id, label, category, notes, deleted);
    if ('clips' in obj && obj.clips instanceof Array) {
      record.clips = obj.clips
          .filter(RecordClip.isProtoRecordClip)
          .map(RecordClip.fromObj);
    }
    return record;
  }

  static isProtoRecord(obj: any): boolean {
    return 'id' in obj &&
      'label' in obj &&
      'category' in obj;
  }
}

export class RecordClip {
  private _date: Date;
  constructor(
    public slug: string,
    date: string|Date,
    public format: string,
    public runtime: string
  ) {
    this.setDate(date);
  }

  get date(): Date { return this._date; }
  set date(date: Date) { this._date = date; }
  setDate(date: string|Date): void {
    if (typeof date === 'string') {
      date = new Date(<string>date);
    }
    this.date = <Date>date;
  }

  merge(other: RecordClip): RecordClip {
    this.slug = other.slug || this.slug;
    this.date = other.date || this.date;
    this.format = other.format || this.format;
    this.runtime = other.runtime || this.runtime;
    return this;
  }

  compareTo(other: RecordClip): number {
    if (this.date > other.date) {
      return 1;
    } else if (this.date < other.date) {
      return -1;
    } else {
      return 0;
    }
  }

  static compare(a: RecordClip, b: RecordClip): number {
    return a.compareTo(b);
  }

  static isProtoRecordClip(obj: any): boolean {
    return 'slug' in obj &&
      'date' in obj &&
      'format' in obj &&
      'runtime' in obj;
  }

  static fromObj(obj: IRecordClip): RecordClip {
    let {slug, date, format, runtime} = obj;
    return new RecordClip(slug, date, format, runtime);
  }
}
