import { verifyChallengeToken } from '../../shared/lib/passkeys';
import { PasskeyServer } from '../../shared/lib/passkey-server';

export default async ({ req, res, log, error }: any) => {
  try {
    const body = JSON.parse(req.bodyRaw || '{}');
    const { userId: rawUserId, assertion, challengeToken, challenge } = body;
    const userId = String(rawUserId).trim().toLowerCase();
    
    if (!userId || !assertion || !challengeToken || !challenge) {
      return res.json({ error: 'userId, assertion, challenge and challengeToken required' }, 400);
    }

    try {
      verifyChallengeToken(userId, challenge, challengeToken);
    } catch (e) {
      return res.json({ error: (e as Error).message }, 400);
    }

    const forwardedProto = req.headers['x-forwarded-proto'];
    const forwardedHost = req.headers['x-forwarded-host'];
    const hostHeader = forwardedHost || req.headers['host'] || 'localhost';
    const protocol = (forwardedProto || 'https').toLowerCase();
    const hostNoPort = hostHeader.split(':')[0];
    const rpID = process.env.RP_ID || process.env.NEXT_PUBLIC_RP_ID || hostNoPort || 'localhost';
    const origin = process.env.ORIGIN || process.env.NEXT_PUBLIC_ORIGIN || `${protocol}://${hostHeader}`;

    if (typeof assertion !== 'object' || !assertion) {
      return res.json({ error: 'Malformed assertion: not an object' }, 400);
    }
    
    if (!(assertion as any).response || !(assertion as any).response.clientDataJSON) {
      return res.json({ error: 'Malformed assertion: missing response.clientDataJSON' }, 400);
    }

    const debug = process.env.WEBAUTHN_DEBUG === '1';

    const server = new PasskeyServer();
    const result = await server.authenticatePasskey(userId, assertion, challenge, { rpID, origin });
    
    if (!result?.token?.secret) {
      return res.json({ error: 'Failed to create custom token' }, 500);
    }
    
    return res.json({ success: true, token: result.token }, 200);
  } catch (err) {
    const debug = process.env.WEBAUTHN_DEBUG === '1';
    error((err as Error).message || String(err));
    return res.json({ 
      error: (err as Error).message || String(err), 
      ...(debug ? { stack: (err as Error).stack } : {}) 
    }, 500);
  }
};
