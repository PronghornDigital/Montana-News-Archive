export class RecordDatabase  {
  [k: string]: Record
}

export interface IRecord {
  label: string,
  family: string,
  medium: string,
  notes?: string,
  stories?: IStory[],
  deleted?: boolean,
}

export interface IStory {
  slug: string,
  date: string|Date,
  format?: string,
  runtime?: string,
  notes?: string,
  reporter?: string,
  photographer?: string
}

export class Record {
  private _id: string;
  private _label: string;
  private _first: Date;
  private _last: Date;
  private _stories: Story[] = [];

  constructor(
    label: string,
    public family: string,
    public medium: string = '',
    public notes: string = '',
    public deleted: boolean = false,
    stories: Story[] = []
  ) {
    this.label = label;
    this.addStories(stories);
  }

  get id(): string { return this._id; }
  get label(): string { return this._label; }
  set label(label: string) {
    this._label = label;
    this._id = makeRecordId(label);
  }
  get first(): Date { return this._first; }
  set first(date: Date) { this.setFirst(date); }
  get last(): Date { return this._last; }
  set last(date: Date) { this.setLast(date); }
  get combinedDate(): string {
    return this.first + " " + this.last;
  }
  get stories(): Story[] { return this._stories; }

  setFirst(date: string|Date): void {
    debugger;
    if (typeof date === 'string') {
      date = new Date(<string>date);
    }
    this._first = <Date>date;
  }
  setLast(date: string|Date): void {
    debugger;
    if (typeof date === 'string') {
      date = new Date(<string>date);
    }
    this._last = <Date>date;
  }
  addStories(stories: Story[]): Record {
    this._stories = this._stories.concat(stories).sort(Story.compare);
    return this;
  }

  /**
   * Merges the contents of the specified Record into current Record.
   *
   * This method merges the contents of the specified Record into the current
   * Record. Fields that are set in the specified record overwrite
   * the corresponding fields in the current record. Storys are
   * appended. Record date ranges are expanded.
   */
  merge(other: Record): Record {
    this.label = other.label || this.label;
    this.family = other.family || this.family;
    this.start = other.start || this.start;
    this.end = other.end || this.end;
    this.medium = other.medium || this.medium;
    this.notes = other.notes || this.notes;
    this.addStories(other.stories);
    return this;
  }

  toJSON(): IRecord {
      return {
        label: this.label,
        family: this.family,
        medium: this.medium,
        start: this.start,
        end: this.end,
        notes: this.notes,
        stories: this.stories,
        deleted: this.deleted
      };
  }

  static fromObj(obj: IRecord): Record {
    let {label, family, medium, notes, deleted} = obj;
    let record = new Record(label, family, medium, notes, deleted);
    if ('stories' in obj && obj.stories instanceof Array) {
      record.addStories(
          obj.stories
          .filter(Story.isProtoStory)
          .map(Story.fromObj));
    }
    return record;
  }

  static isProtoRecord(obj: any): boolean {
    return 'label' in obj &&
      'family' in obj;
  }
}

export class Story {
  private _date: Date;
  constructor(
    public slug: string,
    date: string|Date,
    public format: string = 'Unknown',
    public runtime: string = '0:00',
    public notes: string = '',
    public reporter: string = 'Unknown',
    public photographer: string = 'Unknown'
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

  merge(other: Story): Story {
    this.slug = other.slug || this.slug;
    this.date = other.date || this.date;
    this.format = other.format || this.format;
    this.runtime = other.runtime || this.runtime;
    this.notes = other.notes || this.notes;
    this.reporter = other.reporter || this.reporter;
    this.photographer = other.photographer || this.photographer;
    return this;
  }

  compareTo(other: Story): number {
    if (this.date > other.date) {
      return 1;
    } else if (this.date < other.date) {
      return -1;
    } else {
      return 0;
    }
  }

  static compare(a: Story, b: Story): number {
    return a.compareTo(b);
  }

  toJSON(): IStory {
      return {
        slug: this.slug,
        date: this.date.toJSON(),
        format: this.format,
        runtime: this.runtime,
        notes: this.notes,
        reporter: this.reporter,
        photographer: this.photographer
      };
  }

  static isProtoStory(obj: any): boolean {
    return 'slug' in obj &&
      'date' in obj &&
      'format' in obj &&
      'runtime' in obj;
  }

  static fromObj(obj: IStory): Story {
    let {slug, date, format, runtime, notes, reporter, photographer} = obj;
    return new Story(
      slug, date, format, runtime, notes, reporter, photographer
    );
  }
}

export function makeRecordId(label: string): string {
  return label
    // .replace(/[0x00-0x1f]/g, '') // Strip low bytes
    // .replace(/[0x7f]/g, '') // Strip 127
    // TODO strip > 127
    .replace(/\s+/g, '_') // Whitespace to underscore
    .replace(/[\/\\\+=]/g, '-') // Separators to hyphen
    .replace(/[^a-zA-Z0-9_\-]/g, '') // Strip non-letters
    .toLowerCase()
    ;
}
