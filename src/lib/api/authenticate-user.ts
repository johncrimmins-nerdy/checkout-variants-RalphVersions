/**
 * User authentication API
 * Matches original REST API implementation
 * Always uses Next.js proxy to avoid CORS issues
 */

export type LoginResponse =
  | {
      accessToken: string;
      userID: string;
    }
  | {
      error: 'auth_user failed';
    };

/**
 * Authenticate user with email and password
 * Uses v1 REST API (not GraphQL)
 * Always uses Next.js proxy to avoid CORS issues
 */
export async function authenticateUser(email: string, password: string): Promise<LoginResponse> {
  // Always use Next.js API proxy
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/checkout';
  const loginApiUrl = `${basePath}/api/login`;

  const response = await fetch(loginApiUrl, {
    body: JSON.stringify({ email, password }),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  return await response.json();
}
