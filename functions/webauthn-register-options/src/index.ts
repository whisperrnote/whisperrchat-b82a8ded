import { generateRegistrationOptions } from '@simplewebauthn/server';
import { issueChallenge } from '../../../shared/lib/passkeys.js';
import { PasskeyServer } from '../../../shared/lib/passkey-server.js';
import crypto from 'crypto';

export default async ({ req, res, log, error }: any) => {
  try {
    const { userId: rawUserId, userName } = JSON.parse(req.bodyRaw || '{}');
    const userId = String(rawUserId).trim().toLowerCase();
    
    if (!userId || !userName) {
      return res.json({ error: 'userId and userName required' }, 400);
    }

    const rpName = process.env.NEXT_PUBLIC_RP_NAME || process.env.RP_NAME || 'Appwrite Passkey';
    
    const gate = new PasskeyServer();
    if (await gate.shouldBlockPasskeyForEmail(userId)) {
      return res.json({ error: 'Account already connected with wallet' }, 403);
    }
    
    const headers = req.headers || {};
    const forwardedHost = headers['x-forwarded-host'] || headers['host'];
    const hostNoPort = forwardedHost ? forwardedHost.split(':')[0] : 'localhost';
    const rpID = process.env.NEXT_PUBLIC_RP_ID || process.env.RP_ID || hostNoPort;

    const userIdHash = crypto.createHash('sha256').update(String(userId)).digest();
    const userIdBuffer = new Uint8Array(Buffer.from(userIdHash));

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userIdBuffer,
      userName,
      attestationType: 'none',
      authenticatorSelection: {
        userVerification: 'preferred',
      },
    });

    const ttl = parseInt(process.env.WEBAUTHN_CHALLENGE_TTL_MS || '120000', 10);
    const issued = issueChallenge(userId, ttl);
    
    log(`Registration options generated for user: ${userId}`);
    
    return res.json({
      ...options,
      challengeToken: issued.challengeToken,
      challenge: issued.challenge,
      user: {
        ...options.user,
        id: Buffer.from(userIdHash).toString('base64url')
      }
    });
    
  } catch (err) {
    const errorMessage = (err as Error).message || String(err);
    error(`Register options error: ${errorMessage}`);
    return res.json({ error: errorMessage }, 500);
  }
};
