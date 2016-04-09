import {
  expect
} from 'chai';

import {
  Image,
  Record,
  Story,
  Video
} from './record';

describe('Record', function() {
  describe('factory', function() {
    it('tests proto objects', function() {
      expect(Record.isProtoRecord({
        label: 'Tape 1',
        family: 'Tapes',
        medium: '3/4"'
      })).to.be.true;

      expect(Record.isProtoRecord({
        id: 'tape-1',
        label: 'Tape 1',
        family: 'Tapes',
        medium: '3/4"',
        deleted: false,
        stories: []
      })).to.be.true;

      expect(Record.isProtoRecord({
        family: 'Tapes',
        deleted: false,
        stories: []
      })).to.be.false;
    });

    it('has a factory', function() {
      let protoStory: any = {
        slug: 'Story 1',
        date: new Date('10/15/2015'),
        format: 'VO',
        runtime: '5:30'
      };
      let protoRecord: any = {
        label: 'Tape 1',
        family: 'Tapes',
        medium: '3/4"',
        stories: [ protoStory ]
      };

      let record: Record = Record.fromObj(protoRecord);
      expect(record.id).to.equal('tape_1');
      expect(record.stories.length).to.equal(1);
      Object.keys(protoRecord)
          .filter(_ => _ !== 'stories')
          .forEach(_ => {
            expect(record).to.have.property(_).that.equals(protoRecord[_]);
          });
      Object.keys(protoStory).forEach(_ => {
        expect(record.stories[0])
            .to.have.property(_)
            .that.equals(protoStory[_]);
      });
    });
  });

  describe('Label to ID Normalization', function() {
    it('normalizes labels', function() {
      let record = new Record('', 'Test', '3/4"');
      let labels = {
        'Tape 1': 'tape_1',
        'Tape/1': 'tape-1',
        'Tape          1': 'tape_1',
        '^&*()Tape': 'tape'
      };
      Object.keys(labels).forEach((k) => {
        record.label = k;
        expect(record.id).to.equal(labels[k]);
      });
    });
  });

  describe('Date ranges', function() {
    // This functionality is deprecated while we edit the record date directly.
    it.skip('manages ranges of story dates', function() {
        let record = new Record('Tape 1', 'Test', '3/4"');
        record.addStories([
          new Story('Story 1', new Date('10/15/2015'), 'VO', '5:30')
        ]);
        expect(record.first.toDateString())
            .to.equal(new Date('10/15/2015').toDateString());
        expect(record.last.toDateString())
            .to.equal(new Date('10/15/2015').toDateString());

        record.addStories([
          new Story('Story 2', new Date('10/10/2015'), 'VO', '5:30')
        ]);
        expect(record.first.toDateString())
            .to.equal(new Date('10/10/2015').toDateString());
        expect(record.last.toDateString())
            .to.equal(new Date('10/15/2015').toDateString());

        record.addStories([
          new Story('Story 3', new Date('10/16/2015'), 'VO', '5:30')
        ]);
        expect(record.first.toDateString())
            .to.equal(new Date('10/10/2015').toDateString());
        expect(record.last.toDateString())
            .to.equal(new Date('10/16/2015').toDateString());
    });
  });

  describe('Merging', function() {
    it('merges records sanely', function() {
      let record1 = new Record('Tape 1', 'Test', '3/4"');
      record1.addStories([
        new Story('Story 1', new Date('10/15/2015'), 'VO', '5:30')
      ]);
      let record2 = new Record('Tape 1', 'Test', '3/4"');
      record2.addStories([
        new Story('Story 1', new Date('10/15/2015'), 'VO', '5:30'),
        new Story('Story 2', new Date('10/15/2015'), 'VO', '5:30')
      ]);
      record1.merge(record2);
      let record3 = new Record('Tape 1', 'Test', '3/4"');
      record1.merge(record3);
      expect(record1.stories.length).to.equal(2);
    });
    it('can replace media', function() {
      let record1 = new Record('Tape 1', 'Test', '3/4"');
      record1.addImages([new Image('image.jpg')]);
      record1.addVideos([new Video('video.mp4')]);
      let record2 = new Record('Tape 1', 'Test', '3/4"');
      record2.addImages([new Image('other.jpg')]);
      record2.addVideos([new Video('other.mp4')]);
      record1.merge(record2);
      expect(record1.images.length).to.equal(2);
      record1.merge(record2, true);
      expect(record1.images.length).to.equal(1);
    });
  });

  describe('Other functionality', function() {
    it('keeps track of basic modified state', function() {
      let record1 = new Record('Tape 1', 'Test', '3/4"');
      record1.label = 'David 1';
      expect(record1.modified).to.be.true;
    });

    it('allows stories with duplicate slugs', function() {
      let record = new Record('Tape 1', 'Test', '3/4"');
      record.addStories([
        new Story('Story 1', new Date('10/15/2015'), 'VO', '5:30'),
        new Story('Story 1', new Date('10/15/2015'), 'VO', '8:30')
      ]);
      expect(record.stories.length).to.equal(2);
    });

    it('can rename all media', function() {
      let record = new Record('Renamed Tape', 'Test', '3/4"');
      record.addImages([
        new Image('tape_1/tape_1_1234.jpeg'),
        new Image('tape_1/tape_1_5678.jpeg'),
      ]);
      record.addVideos([
        new Video('tape_1/tape_1_1234.mov'),
        new Video('tape_1/foo.mov'),
      ]);
      record.updateMedia('tape_1');
      expect(record.images.map((_) => _.path)).to.deep.equal([
        'renamed_tape/tape_1_1234.jpeg',
        'renamed_tape/tape_1_5678.jpeg',
      ]);
      expect(record.videos.map((_) => _.path)).to.deep.equal([
        'renamed_tape/tape_1_1234.mov',
        'renamed_tape/foo.mov'
      ]);
    });

    it('sorts records first by family, then by date', function() {
      let recorda1 = new Record('A1', 'A', '3/4"');
      recorda1.first = new Date('10/15/2015');
      let recorda2 = new Record('A2', 'A', '3/4"');
      recorda2.first = new Date('10/16/2015');
      let recordb1 = new Record('B1', 'B', '3/4"');
      recordb1.first = new Date('10/15/2015');
      let recordb2 = new Record('B2', 'B', '3/4"');
      recordb2.first = new Date('10/16/2015');

      let records: Record[] = [
        recorda2, recordb1, recordb2, recorda1
      ].sort(Record.comparator);

      expect(records[0]).to.equal(recorda1);
      expect(records[1]).to.equal(recorda2);
      expect(records[2]).to.equal(recordb1);
      expect(records[3]).to.equal(recordb2);
    });
  });
});

describe('Story', function() {
  describe('factory', function() {
    it('tests proto objects', function() {
      expect(Story.isProtoStory({
        slug: 'Story 1',
        date: new Date('10/15/2015'),
        format: 'VO',
        runtime: '5:30'
      })).to.be.true;

      expect(Story.isProtoStory({
        slug: 'Story 1',
      })).to.be.false;

      expect(Story.isProtoStory({
        slug: 'Story 1',
        date: new Date('10/15/2015'),
        format: 'VO',
        runtime: '5:30',
        extra: 'property'
      })).to.be.true;
    });

    it('has a factory', function() {
      let protoStory: any = {
        slug: 'Story 1',
        date: new Date('10/15/2015'),
        format: 'VO',
        runtime: '5:30'
      };
      let story = Story.fromObj(protoStory);
      Object.keys(protoStory).forEach((_: string) => {
        expect(story).to.have.property(_).that.equals(protoStory[_]);
      });
    });
  });
  describe('operations', function() {
    it('compares', function() {
      expect(Story.fromObj({
        slug: 'Story 1',
        date: new Date('10/10/2015'),
        format: 'VO',
        runtime: '5:30'
      }).compareTo(Story.fromObj({
        slug: 'Story 2',
        date: new Date('10/15/2015'),
        format: 'VO',
        runtime: '5:30'
      }))).to.equal(-1);

      expect(Story.fromObj({
        slug: 'Story 1',
        date: new Date('10/15/2015'),
        format: 'VO',
        runtime: '5:30'
      }).compareTo(Story.fromObj({
        slug: 'Story 2',
        date: new Date('10/15/2015'),
        format: 'VO',
        runtime: '5:30'
      }))).to.equal(0);

      expect(Story.fromObj({
        slug: 'Story 1',
        date: new Date('10/15/2015'),
        format: 'VO',
        runtime: '5:30'
      }).compareTo(Story.fromObj({
        slug: 'Story 2',
        date: new Date('10/10/2015'),
        format: 'VO',
        runtime: '5:30'
      }))).to.equal(1);
    });

    it('compares statically', function() {
      expect(Story.compare(
        Story.fromObj({
          slug: 'Story 1',
          date: new Date('10/10/2015'),
          format: 'VO',
          runtime: '5:30'
        }),
        Story.fromObj({
          slug: 'Story 2',
          date: new Date('10/15/2015'),
          format: 'VO',
          runtime: '5:30'
        })
      )).to.equal(-1);

      expect(Story.compare(
        Story.fromObj({
          slug: 'Story 1',
          date: new Date('10/15/2015'),
          format: 'VO',
          runtime: '5:30'
        }),
        Story.fromObj({
          slug: 'Story 2',
          date: new Date('10/15/2015'),
          format: 'VO',
          runtime: '5:30'
        })
      )).to.equal(0);

      expect(Story.compare(
        Story.fromObj({
          slug: 'Story 1',
          date: new Date('10/15/2015'),
          format: 'VO',
          runtime: '5:30'
        }),
        Story.fromObj({
          slug: 'Story 2',
          date: new Date('10/10/2015'),
          format: 'VO',
          runtime: '5:30'
        })
      )).to.equal(1);
    });
  });
});
