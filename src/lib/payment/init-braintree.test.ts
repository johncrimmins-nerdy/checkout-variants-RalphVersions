import { IntegrationError } from '../utils/error-classes';
import { initBraintree } from './init-braintree';

// Mock dependencies
const mockGetBraintreeToken = jest.fn();
jest.mock('./get-braintree-token', () => ({
  getBraintreeToken: () => mockGetBraintreeToken(),
}));

const mockClientCreate = jest.fn();
jest.mock('braintree-web', () => ({
  client: {
    create: (opts: unknown) => mockClientCreate(opts),
  },
}));

describe('initBraintree', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates Braintree client with token', async () => {
    const mockClient = { getVersion: jest.fn() };
    mockGetBraintreeToken.mockResolvedValue('test-token-123');
    mockClientCreate.mockResolvedValue(mockClient);

    const result = await initBraintree();

    expect(result).toBe(mockClient);
    expect(mockClientCreate).toHaveBeenCalledWith({
      authorization: 'test-token-123',
    });
  });

  it('throws IntegrationError when token is null', async () => {
    mockGetBraintreeToken.mockResolvedValue(null);

    await expect(initBraintree()).rejects.toThrow(IntegrationError);
    await expect(initBraintree()).rejects.toThrow(/Braintree token is null/);
  });

  it('throws IntegrationError when client creation fails', async () => {
    mockGetBraintreeToken.mockResolvedValue('test-token');
    mockClientCreate.mockRejectedValue(new Error('Client creation failed'));

    await expect(initBraintree()).rejects.toThrow(IntegrationError);
    await expect(initBraintree()).rejects.toThrow(/Braintree widget failed to load/);
  });

  it('includes payment step in error context', async () => {
    mockGetBraintreeToken.mockResolvedValue(null);

    try {
      await initBraintree();
    } catch (error) {
      expect(error).toBeInstanceOf(IntegrationError);
      expect((error as IntegrationError).context).toEqual(
        expect.objectContaining({
          payment_step: 'widget_initialization',
        })
      );
    }
  });
});
