import electronicPolicy from './electronic-policy';

describe('electronic-policy', () => {
  it('exports HTML content string', () => {
    expect(typeof electronicPolicy).toBe('string');
  });

  it('contains terms-container div', () => {
    expect(electronicPolicy).toContain('class="terms-container');
  });

  it('contains essential policy content', () => {
    // Should have Electronic Signature header
    expect(electronicPolicy).toContain('Electronic Signature');

    // Should have Varsity Tutors reference
    expect(electronicPolicy).toContain('Varsity Tutors');
  });

  it('is not empty', () => {
    expect(electronicPolicy.length).toBeGreaterThan(1000);
  });
});
