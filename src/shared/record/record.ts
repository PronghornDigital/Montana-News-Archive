export class RecordDatabase  {
  [k: string]: Record
}

export interface IRecord {
  label: string;
  family: string;
  medium: string;
  first?: Date;
  last?: Date;
  notes?: string;
  stories?: IStory[];
  images?: Image[];
  videos?: Video[];
  deleted?: boolean;
  rawImage?: any;
  baseId?: string;
}

export interface IStory {
  slug: string;
  date: string|Date;
  format?: string;
  runtime?: string;
  notes?: string;
  reporter?: string;
  photographer?: string;
}

export interface IImage {
  path: string;
}

export interface IVideo {
  path: string;
}

export class Record implements IRecord {
  public isNewTape: boolean = false;
  public rawImage: any = null;

  private _id: string;
  private _label: string;
  private _first: Date;
  private _last: Date;
  private _stories: Story[] = [];
  public images: Image[] = [];
  public videos: Video[] = [];
  public baseId: string = '';

  constructor(
    label: string,
    public family: string,
    public medium: string = '',
    public notes: string = '',
    first: string|Date = '',
    last: string|Date = '',
    public deleted: boolean = false,
    stories: Story[] = [],
    images: Image[] = [],
    videos: Video[] = []
  ) {
    if (first !== '') {
      this.setFirst(first);
    }
    if (last !== '') {
      this.setLast(last);
    }
    this.label = label;
    this.baseId = this.id;
    this.addStories(stories);
    this.addImages(images);
    this.addVideos(videos);
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
  get combinedDate(): string { return this.first + ' ' + this.last; }
  get stories(): Story[] { return this._stories; }
  get modified(): boolean { return this.id !== this.baseId; }

  forceId(id: string): void {
    // Here be dragons.
    this._id = id;
    this.baseId = id;
  }

  setFirst(date: string|Date): void {
    if (typeof date === 'string') {
      if (date === '') {
        date = new Date();
      } else {
        date = new Date(<string>date);
      }
    }
    this._first = <Date>date;
  }
  setLast(date: string|Date): void {
    if (typeof date === 'string') {
      if (date === '') {
        date = new Date();
      } else {
        date = new Date(<string>date);
      }
    }
    this._last = <Date>date;
  }
  addStories(stories: Story[]): Record {
    this._stories = this._stories.concat(stories).reduce(
        (p: Story[], c: Story) => {
          if (indexOfC(p, c, (a, b) => a.equals(b)) < 0) {
            p.push(c);
          }
          return p;
        },
        [])
        .sort(Story.compare);
    return this;
  }

  removeStory(story: Story): Record {
    const i = this._stories.indexOf(story);
    if (i > -1) {
      const head = this._stories.slice(0, i);
      const tail = this._stories.slice(i + 1);
      this._stories = head.concat(tail);
    }
    return this;
  }

  addImages(images: Image[]): Record {
    this.images = this.images.concat(images).reduce(
        (p: Image[], c: Image) => {
          for (let i = 0; i < p.length; i++) {
            if (p[i].path === c.path) {
              return p;
            }
          }
          p.push(c);
          return p;
        },
        []
    );
    return this;
  }

  removeImage(image: Image): Record {
    const i = this.images.indexOf(image);
    if (i > -1) {
      const head = this.images.slice(0, i);
      const tail = this.images.slice(i + 1);
      this.images = head.concat(tail);
    }
    return this;
  }

  addVideos(videos: Video[]): Record {
    this.videos = this.videos.concat(videos).reduce(
        (p: Video[], c: Video) => {
          for (let i = 0; i < p.length; i++) {
            if (p[i].path === c.path) {
              return p;
            }
          }
          p.push(c);
          return p;
        },
        []
    );
    return this;
  }

  updateMedia(oldId: string) {
    this.videos.forEach((_: Video) => {
      _.path = _.path.replace(oldId, this.id);
    });
    this.images.forEach((_: Image) => {
      _.path = _.path.replace(oldId, this.id);
    });
  }

  /**
   * Merges the contents of the specified Record into current Record.
   *
   * This method merges the contents of the specified Record into the current
   * Record. Fields that are set in the specified record overwrite
   * the corresponding fields in the current record. Stories are replaced,
   * unless they are not present in `other`. Record date ranges are expanded.
   */
  merge(other: Record, replaceMedia = false): Record {
    this.label = other.label || this.label;
    this.family = other.family || this.family;
    this.medium = other.medium || this.medium;
    this.notes = other.notes || this.notes;
    // Stories can be edited, so merging would duplicate them. Instead, copy the
    // new stories, and trust that the user calls this correctly.
    this._stories = other.stories.length > 0 ? other.stories : this.stories;
    if (replaceMedia) {
      this.images = other.images || [];
      this.videos = other.videos || [];
    } else {
      this.addImages(other.images || []);
      this.addVideos(other.videos || []);
    }
    return this;
  }

  toJSON(): IRecord {
    return {
      label: this.label,
      family: this.family,
      medium: this.medium,
      first: this.first,
      last: this.last,
      notes: this.notes,
      stories: this.stories,
      images: this.images,
      videos: this.videos,
      deleted: this.deleted
    };
  }

  compareTo(other: Record): number {
    if (this.family === other.family) {
      return compareDates(this.first, other.first);
    } else {
      return this.family.localeCompare(other.family);
    }
  }

  static comparator(a: Record, b: Record): number {
    return a.compareTo(b);
  }

  static fromObj(obj: IRecord): Record {
    let {label, family, medium, notes, deleted, first, last} = obj;
    let record = new Record(label, family, medium, notes, first, last, deleted);
    if ('stories' in obj && obj.stories instanceof Array) {
      record.addStories(
          obj.stories
          .filter(Story.isProtoStory)
          .map(Story.fromObj));
    }
    if ('images' in obj && obj.images instanceof Array) {
      record.addImages(
          obj.images
          .filter(Image.isProtoImage)
          .map(Image.fromObj));
    }
    if ('videos' in obj && obj.videos instanceof Array) {
      record.addVideos(
          obj.videos
          .filter(Video.isProtoVideo)
          .map(Video.fromObj));
    }
    return record;
  }

  static isProtoRecord(obj: any): boolean {
    return 'label' in obj &&
      'family' in obj;
  }
}

export class Image {
  constructor(
    public path: string
  ) { }

  toJSON(): IImage {
    return {
      path: this.path
    };
  }

  static fromObj(obj: IImage): Image {
    let {path} = obj;
    return new Image(path);
  }

  static isProtoImage(obj: any): boolean {
    // We can't have an image without a URL.
    return 'path' in obj;
  }
}

export class Video {
  constructor(
    public path: string
  ) { }

  toJSON(): IVideo {
    return {
      path: this.path
    };
  }

  static fromObj(obj: IVideo): Video {
    let {path} = obj;
    return new Video(path);
  }

  static isProtoVideo(obj: any): boolean {
    // We can't have an image without a URL.
    return 'path' in obj;
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
      if (date === '') {
        date = new Date();
      } else {
        date = new Date(<string>date);
      }
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
    return compareDates(this.date, other.date);
  }

  static compare(a: Story, b: Story): number {
    return a.compareTo(b);
  }

  equals(other: Story): boolean {
    return this.slug === other.slug &&
      this.date.getTime() === other.date.getTime() &&
      this.format === other.format &&
      this.runtime === other.runtime &&
      this.notes === other.notes &&
      this.reporter === other.reporter &&
      this.photographer === other.photographer;
  }

  static equals(a: Story, b: Story): boolean {
    return a.equals(b);
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

export function indexOfC<T>(
    list: T[],
    item: T,
    comparator: (a: T, b: T) => boolean
): number {
  return list.reduce(indexOfComparator, -1);
  function indexOfComparator(found: number, value: T, index: number): number {
      if (found > -1) { return found; }
      if (comparator(value, item)) { return index; }
      return -1;
    }
}

export function compareDates(a: Date, b: Date): number {
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 0;
    }
}
