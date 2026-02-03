import type { PhylloUser, PhylloAccount, PhylloContent } from '@/types/phyllo';

const PHYLLO_API_BASE = process.env.PHYLLO_ENVIRONMENT === 'production'
  ? 'https://api.getphyllo.com'
  : 'https://api.sandbox.getphyllo.com';

const PHYLLO_CLIENT_ID = process.env.PHYLLO_CLIENT_ID;
const PHYLLO_CLIENT_SECRET = process.env.PHYLLO_CLIENT_SECRET;

// Get Basic Auth token
function getAuthHeader(): string {
  const credentials = Buffer.from(`${PHYLLO_CLIENT_ID}:${PHYLLO_CLIENT_SECRET}`).toString('base64');
  return `Basic ${credentials}`;
}

// Create a Phyllo user
export async function createPhylloUser(externalId: string, name: string): Promise<PhylloUser> {
  const response = await fetch(`${PHYLLO_API_BASE}/v1/users`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      external_id: externalId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Phyllo user: ${error}`);
  }

  return response.json();
}

// Generate SDK token for Phyllo Connect
export async function generateSdkToken(userId: string): Promise<string> {
  const response = await fetch(`${PHYLLO_API_BASE}/v1/sdk-tokens`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      products: ['IDENTITY', 'ENGAGEMENT'],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate SDK token: ${error}`);
  }

  const data = await response.json();
  return data.sdk_token;
}

// Get user's connected accounts
export async function getAccounts(userId: string): Promise<PhylloAccount[]> {
  const response = await fetch(`${PHYLLO_API_BASE}/v1/accounts?user_id=${userId}`, {
    headers: {
      'Authorization': getAuthHeader(),
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get accounts: ${error}`);
  }

  const data = await response.json();
  return data.data || [];
}

// Get content (videos) for an account
export async function getContent(accountId: string, limit = 30): Promise<PhylloContent[]> {
  const response = await fetch(
    `${PHYLLO_API_BASE}/v1/social/contents?account_id=${accountId}&limit=${limit}`,
    {
      headers: {
        'Authorization': getAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get content: ${error}`);
  }

  const data = await response.json();
  return data.data || [];
}

// Get engagement metrics for content
export async function getEngagementMetrics(accountId: string): Promise<any> {
  const response = await fetch(
    `${PHYLLO_API_BASE}/v1/social/engagement?account_id=${accountId}`,
    {
      headers: {
        'Authorization': getAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get engagement metrics: ${error}`);
  }

  return response.json();
}
