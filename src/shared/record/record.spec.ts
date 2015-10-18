import {
  expect
} from 'chai';

import {
  RecordClip
} from './record';

describe('RecordClip', function() {
  describe('factory', function() {
    it('tests proto objects', function() {
      expect(RecordClip.isProtoRecordClip({
        slug: "Clip 1",
        date: new Date('10/15/2105'),
        format: "3/4\"",
        runtime: "5:30"
      })).to.be.true;

      expect(RecordClip.isProtoRecordClip({
        slug: "Clip 1",
      })).to.be.false;

      expect(RecordClip.isProtoRecordClip({
        slug: "Clip 1",
        date: new Date('10/15/2105'),
        format: "3/4\"",
        runtime: "5:30",
        extra: "property"
      })).to.be.true;
    });

    it('has a factory', function() {
      let protoRecordClip: any = {
        slug: "Clip 1",
        date: new Date('10/15/2105'),
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
        date: new Date('10/10/2105'),
        format: "3/4\"",
        runtime: "5:30"
      }).compareTo(RecordClip.fromObj({
        slug: "Clip 2",
        date: new Date('10/15/2105'),
        format: "3/4\"",
        runtime: "5:30"
      }))).to.equal(-1);

      expect(RecordClip.fromObj({
        slug: "Clip 1",
        date: new Date('10/15/2105'),
        format: "3/4\"",
        runtime: "5:30"
      }).compareTo(RecordClip.fromObj({
        slug: "Clip 2",
        date: new Date('10/15/2105'),
        format: "3/4\"",
        runtime: "5:30"
      }))).to.equal(0);

      expect(RecordClip.fromObj({
        slug: "Clip 1",
        date: new Date('10/15/2105'),
        format: "3/4\"",
        runtime: "5:30"
      }).compareTo(RecordClip.fromObj({
        slug: "Clip 2",
        date: new Date('10/10/2105'),
        format: "3/4\"",
        runtime: "5:30"
      }))).to.equal(1);
    });

    it('compares statically', function() {
      expect(RecordClip.compare(
        RecordClip.fromObj({
          slug: "Clip 1",
          date: new Date('10/10/2105'),
          format: "3/4\"",
          runtime: "5:30"
        }),
        RecordClip.fromObj({
          slug: "Clip 2",
          date: new Date('10/15/2105'),
          format: "3/4\"",
          runtime: "5:30"
        })
      )).to.equal(-1);

      expect(RecordClip.compare(
        RecordClip.fromObj({
          slug: "Clip 1",
          date: new Date('10/15/2105'),
          format: "3/4\"",
          runtime: "5:30"
        }),
        RecordClip.fromObj({
          slug: "Clip 2",
          date: new Date('10/15/2105'),
          format: "3/4\"",
          runtime: "5:30"
        })
      )).to.equal(0);

      expect(RecordClip.compare(
        RecordClip.fromObj({
          slug: "Clip 1",
          date: new Date('10/15/2105'),
          format: "3/4\"",
          runtime: "5:30"
        }),
        RecordClip.fromObj({
          slug: "Clip 2",
          date: new Date('10/10/2105'),
          format: "3/4\"",
          runtime: "5:30"
        })
      )).to.equal(1);
    });
  });
});
