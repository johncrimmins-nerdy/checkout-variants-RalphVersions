import termsOfCustomerAccountUse from './terms-of-customer-account-use';

describe('terms-of-customer-account-use', () => {
  it('exports HTML content string', () => {
    expect(typeof termsOfCustomerAccountUse).toBe('string');
  });

  it('contains terms-container div', () => {
    expect(termsOfCustomerAccountUse).toContain('class="terms-container');
  });

  it('contains essential terms content', () => {
    // Should have Terms of Use reference
    expect(termsOfCustomerAccountUse).toContain('Terms');

    // Should have Varsity Tutors reference
    expect(termsOfCustomerAccountUse).toContain('Varsity Tutors');
  });

  it('is not empty', () => {
    expect(termsOfCustomerAccountUse.length).toBeGreaterThan(1000);
  });
});
