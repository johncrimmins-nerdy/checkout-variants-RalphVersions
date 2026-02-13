import { SEGMENT_MESSAGES } from './retargeting-messages';

describe('retargeting-messages', () => {
  describe('SEGMENT_MESSAGES', () => {
    it('has all expected segment keys', () => {
      const expectedKeys = ['all', 'ca', 'hs', 'k5', 'ms', 'tp'];

      expectedKeys.forEach((key) => {
        expect(SEGMENT_MESSAGES).toHaveProperty(key);
      });
    });

    it('each message has header and body', () => {
      Object.values(SEGMENT_MESSAGES).forEach((message) => {
        expect(message).toHaveProperty('header');
        expect(message).toHaveProperty('body');
        expect(typeof message.header).toBe('string');
        expect(typeof message.body).toBe('string');
      });
    });

    describe('segment mappings', () => {
      it('k5 is for Elementary (K-5)', () => {
        expect(SEGMENT_MESSAGES.k5.header).toContain('Child');
      });

      it('ms is for Middle School', () => {
        expect(SEGMENT_MESSAGES.ms.body).toContain('middle schooler');
      });

      it('hs is for High School', () => {
        expect(SEGMENT_MESSAGES.hs.header).toContain('College Prep');
      });

      it('ca is for College/Adult', () => {
        expect(SEGMENT_MESSAGES.ca.header).toContain('Future');
      });

      it('tp is for Test Prep', () => {
        expect(SEGMENT_MESSAGES.tp.header).toContain('Test Score');
      });

      it('all is generic fallback', () => {
        expect(SEGMENT_MESSAGES.all.header).toBe('Achieve More This Year');
      });
    });
  });
});
