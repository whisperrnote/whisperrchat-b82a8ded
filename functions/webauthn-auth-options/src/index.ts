import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { issueChallenge } from '../../shared/lib/passkeys';
import { PasskeyServer } from '../../shared/lib/passkey-server';

export default async ({ req, res, log, error }: any) => {
  try {
    const body = JSON.parse(req.bodyRaw || '{}');
    const { userId: rawUserId } = body;
    const userId = String(rawUserId).trim().toLowerCase();
    
    if (!userId) {
      return res.json({ error: 'userId required' }, 400);
    }

    const forwardedHost = req.headers['x-forwarded-host'];
    const hostHeader = forwardedHost || req.headers['host'] || 'localhost';
    const hostNoPort = hostHeader.split(':')[0];
    const rpID = process.env.RP_ID || process.env.NEXT_PUBLIC_RP_ID || hostNoPort || 'localhost';

    const server = new PasskeyServer();
    
    if (await server.shouldBlockPasskeyForEmail(userId)) {
      return res.json({ error: 'Account already connected with wallet' }, 403);
    }
    
    const userCreds = await server.getPasskeysByEmail(userId);
    const allowCredentials = userCreds
      .filter((c) => c && c.id && typeof c.id === 'string')
      .map((c) => ({ id: c.id, type: 'public-key' as const }));

    const options = await generateAuthenticationOptions({
      allowCredentials,
      userVerification: 'preferred',
      rpID,
    });

    const issued = issueChallenge(userId, parseInt(process.env.WEBAUTHN_CHALLENGE_TTL_MS || '120000', 10));
    (options as any).challengeToken = issued.challengeToken;
    (options as any).challenge = issued.challenge;
    
    return res.json(options, 200);
  } catch (err) {
    error((err as Error).message || String(err));
    return res.json({ error: (err as Error).message || String(err) }, 500);
  }
};
