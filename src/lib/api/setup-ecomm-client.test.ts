import { setupECommClient } from './setup-ecomm-client';

// Mock dependencies
jest.mock('../utils/get-graphql-url', () => ({
  getGraphQLUrl: jest.fn().mockReturnValue('https://api.vtstaging.com/graphql'),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('setupECommClient', () => {
  const validInput = {
    email: 'test@example.com',
    password: 'SecurePassword123!',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully creates account and returns clientUUID', async () => {
    const mockClientUUID = 'client-uuid-123';

    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        data: {
          setupECommClient: {
            clientUUID: mockClientUUID,
          },
        },
      }),
      ok: true,
      status: 200,
    });

    const result = await setupECommClient(validInput);

    expect(result.clientUUID).toBe(mockClientUUID);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.vtstaging.com/graphql',
      expect.objectContaining({
        body: expect.stringContaining('SetupECommClient'),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
    );
  });

  it('sends correct variables in mutation', async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({
        data: { setupECommClient: { clientUUID: 'uuid' } },
      }),
      ok: true,
      status: 200,
    });

    await setupECommClient(validInput);

    const fetchCall = mockFetch.mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);

    expect(body.variables.input).toEqual(validInput);
    expect(body.operationName).toBe('SetupECommClient');
  });

  describe('error handling', () => {
    it('throws IntegrationError for 401 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(setupECommClient(validInput)).rejects.toThrow(/Unauthorized/);
    });

    it('throws IntegrationError for non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      });

      await expect(setupECommClient(validInput)).rejects.toThrow(/HTTP error: 500/);
    });

    it('throws IntegrationError for GraphQL UNAUTHORIZED error', async () => {
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          errors: [
            {
              extensions: { code: 'UNAUTHORIZED' },
              message: 'Not authorized',
            },
          ],
        }),
        ok: true,
        status: 200,
      });

      await expect(setupECommClient(validInput)).rejects.toThrow(/Unauthorized/);
    });

    it('throws IntegrationError for other GraphQL errors', async () => {
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          errors: [
            {
              extensions: { code: 'VALIDATION_ERROR' },
              message: 'Invalid email format',
            },
          ],
        }),
        ok: true,
        status: 200,
      });

      await expect(setupECommClient(validInput)).rejects.toThrow(/Invalid email format/);
    });

    it('throws IntegrationError when error has no message', async () => {
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          errors: [{ extensions: { code: 'UNKNOWN' } }],
        }),
        ok: true,
        status: 200,
      });

      await expect(setupECommClient(validInput)).rejects.toThrow('Account creation failed');
    });

    it('throws IntegrationError when clientUUID is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          data: { setupECommClient: null },
        }),
        ok: true,
        status: 200,
      });

      await expect(setupECommClient(validInput)).rejects.toThrow('No client UUID returned');
    });

    it('throws IntegrationError when setupECommClient is missing from response', async () => {
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          data: {},
        }),
        ok: true,
        status: 200,
      });

      await expect(setupECommClient(validInput)).rejects.toThrow('No client UUID returned');
    });

    it('logs error and wraps in IntegrationError on fetch failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(setupECommClient(validInput)).rejects.toThrow('Account creation request failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Setup eComm client error:', networkError);

      consoleErrorSpy.mockRestore();
    });
  });
});
