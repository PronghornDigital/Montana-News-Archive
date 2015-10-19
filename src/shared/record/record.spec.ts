import {
  expect
} from 'chai';

import {
  Record,
  RecordClip
} from './record';

describe('Record', function() {
  describe('factory', function() {
    it('tests proto objects', function() {
      expect(Record.isProtoRecord({
        label: 'Tape 1',
        category: 'Tapes'
      })).to.be.true;

      expect(Record.isProtoRecord({
        id: 'tape-1',
        label: 'Tape 1',
        category: 'Tapes',
        deleted: false,
        clips: []
      })).to.be.true;

      expect(Record.isProtoRecord({
        category: 'Tapes',
        deleted: false,
        clips: []
      })).to.be.false;
    });

    it('has a factory', function() {
      let protoRecordClip: any = {
        slug: "Clip 1",
        date: new Date('10/15/2015'),
        format: "3/4\"",
        runtime: "5:30"
      };
      let protoRecord: any = {
        label: 'Tape 1',
        category: 'Tapes',
        clips: [ protoRecordClip ]
      };

      let record: Record = Record.fromObj(protoRecord);
      expect(record.id).to.equal('tape_1');
      expect(record.clips.length).to.equal(1);
      Object.keys(protoRecord)
          .filter(_ => _ != 'clips')
          .forEach(_ => {
            expect(record).to.have.property(_).that.equals(protoRecord[_]);
          });
      Object.keys(protoRecordClip).forEach(_ => {
        expect(record.clips[0])
            .to.have.property(_)
            .that.equals(protoRecordClip[_]);
      });
    });
  });

  describe('Label to ID Normalization', function() {
    it('normalizes labels', function() {
      let record = new Record('', 'Test');
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
    it('manages ranges of clip dates', function() {
        let record = new Record('Tape 1', 'Test');
        record.addClips([
          new RecordClip('Clip 1', new Date('10/15/2015'), "3/4\"", "5:30")
        ]);
        expect(record.first.toDateString())
            .to.equal(new Date('10/15/2015').toDateString());
        expect(record.last.toDateString())
            .to.equal(new Date('10/15/2015').toDateString());

        record.addClips([
          new RecordClip('Clip 2', new Date('10/10/2015'), "3/4\"", "5:30")
        ]);
        expect(record.first.toDateString())
            .to.equal(new Date('10/10/2015').toDateString());
        expect(record.last.toDateString())
            .to.equal(new Date('10/15/2015').toDateString());

        record.addClips([
          new RecordClip('Clip 3', new Date('10/16/2015'), "3/4\"", "5:30")
        ]);
        expect(record.first.toDateString())
            .to.equal(new Date('10/10/2015').toDateString());
        expect(record.last.toDateString())
            .to.equal(new Date('10/16/2015').toDateString());
    });
  });
});

describe('RecordClip', function() {
  describe('factory', function() {
    it('tests proto objects', function() {
      expect(RecordClip.isProtoRecordClip({
        slug: "Clip 1",
        date: new Date('10/15/2015'),
        format: "3/4\"",
        runtime: "5:30"
      })).to.be.true;

      expect(RecordClip.isProtoRecordClip({
        slug: "Clip 1",
      })).to.be.false;

      expect(RecordClip.isProtoRecordClip({
        slug: "Clip 1",
        date: new Date('10/15/2015'),
        format: "3/4\"",
        runtime: "5:30",
        extra: "property"
      })).to.be.true;
    });

    it('has a factory', function() {
      let protoRecordClip: any = {
        slug: "Clip 1",
        date: new Date('10/15/2015'),
        format: "3/4\"",
        runtime: "5:30"
      };
      let clip = RecordClip.fromObj(protoRecordClip);
      Object.keys(protoRecordClip).forEach((_: string) => {
        expect(clip).to.have.property(_).that.equals(protoRecordClip[_]);
      });
    });
  });
  describe('operations', function() {
    it('compares', function() {
      expect(RecordClip.fromObj({
        slug: "Clip 1",
        date: new Date('10/10/2015'),
        format: "3/4\"",
        runtime: "5:30"
      }).compareTo(RecordClip.fromObj({
        slug: "Clip 2",
        date: new Date('10/15/2015'),
        format: "3/4\"",
        runtime: "5:30"
      }))).to.equal(-1);

      expect(RecordClip.fromObj({
        slug: "Clip 1",
        date: new Date('10/15/2015'),
        format: "3/4\"",
        runtime: "5:30"
      }).compareTo(RecordClip.fromObj({
        slug: "Clip 2",
        date: new Date('10/15/2015'),
        format: "3/4\"",
        runtime: "5:30"
      }))).to.equal(0);

      expect(RecordClip.fromObj({
        slug: "Clip 1",
        date: new Date('10/15/2015'),
        format: "3/4\"",
        runtime: "5:30"
      }).compareTo(RecordClip.fromObj({
        slug: "Clip 2",
        date: new Date('10/10/2015'),
        format: "3/4\"",
        runtime: "5:30"
      }))).to.equal(1);
    });

    it('compares statically', function() {
      expect(RecordClip.compare(
        RecordClip.fromObj({
          slug: "Clip 1",
          date: new Date('10/10/2015'),
          format: "3/4\"",
          runtime: "5:30"
        }),
        RecordClip.fromObj({
          slug: "Clip 2",
          date: new Date('10/15/2015'),
          format: "3/4\"",
          runtime: "5:30"
        })
      )).to.equal(-1);

      expect(RecordClip.compare(
        RecordClip.fromObj({
          slug: "Clip 1",
          date: new Date('10/15/2015'),
          format: "3/4\"",
          runtime: "5:30"
        }),
        RecordClip.fromObj({
          slug: "Clip 2",
          date: new Date('10/15/2015'),
          format: "3/4\"",
          runtime: "5:30"
        })
      )).to.equal(0);

      expect(RecordClip.compare(
        RecordClip.fromObj({
          slug: "Clip 1",
          date: new Date('10/15/2015'),
          format: "3/4\"",
          runtime: "5:30"
        }),
        RecordClip.fromObj({
          slug: "Clip 2",
          date: new Date('10/10/2015'),
          format: "3/4\"",
          runtime: "5:30"
        })
      )).to.equal(1);
    });
  });
});
