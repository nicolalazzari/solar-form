/**
 * Google Sheets API integration using service account JWT auth.
 *
 * Uses the Web Crypto API (available in Deno) to sign JWTs —
 * no external dependencies required.
 */

// --- Token cache ---
let cachedToken: string | null = null;
let tokenExpiry = 0;

// --- Helpers ---

function base64url(input: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else {
    bytes = input;
  }

  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// --- Service account credentials ---

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
}

function getCredentials(): ServiceAccountCredentials {
  const raw = Deno.env.get('GOOGLE_SHEETS_CREDENTIALS');
  if (!raw) {
    throw new Error('GOOGLE_SHEETS_CREDENTIALS environment variable is not set');
  }
  return JSON.parse(raw);
}

function getSheetId(): string {
  const id = Deno.env.get('GOOGLE_SHEET_ID');
  if (!id) {
    throw new Error('GOOGLE_SHEET_ID environment variable is not set');
  }
  return id;
}

// --- JWT signing ---

async function createSignedJwt(credentials: ServiceAccountCredentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(credentials.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${base64url(signature)}`;
}

// --- Access token ---

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() / 1000 < tokenExpiry - 60) {
    return cachedToken;
  }

  const credentials = getCredentials();
  const jwt = await createSignedJwt(credentials);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${encodeURIComponent(jwt)}`,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Math.floor(Date.now() / 1000) + (data.expires_in || 3600);

  return cachedToken!;
}

// --- Sheets API ---

export async function appendRow(sheetName: string, values: unknown[]): Promise<void> {
  const token = await getAccessToken();
  const sheetId = getSheetId();

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}!A:A:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [values] }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sheets API error: ${response.status} ${errorText}`);
  }
}
