import crypto from 'crypto';

const secret = process.env.PASSKEY_CHALLENGE_SECRET || 'dev-insecure-secret';

function randomChallenge(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function issueChallenge(userId: string, ttlMs: number) {
  const challenge = randomChallenge();
  const exp = Date.now() + ttlMs;
  const payload = JSON.stringify({ u: userId, c: challenge, e: exp });
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const token = Buffer.from(payload).toString('base64url') + '.' + sig;
  return { challenge, challengeToken: token };
}

export function verifyChallengeToken(userId: string, challenge: string, token: string) {
  const parts = token.split('.');
  if (parts.length !== 2) throw new Error('Malformed challenge token');
  const payloadJson = Buffer.from(parts[0], 'base64url').toString();
  const sig = parts[1];
  const expectedSig = crypto.createHmac('sha256', secret).update(payloadJson).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) throw new Error('Invalid challenge signature');
  let parsed: { u: string; c: string; e: number };
  try { parsed = JSON.parse(payloadJson); } catch { throw new Error('Bad challenge payload'); }
  if (parsed.u !== userId) throw new Error('User mismatch');
  if (parsed.c !== challenge) throw new Error('Challenge mismatch');
  if (Date.now() > parsed.e) throw new Error('Challenge expired');
  return true;
}
