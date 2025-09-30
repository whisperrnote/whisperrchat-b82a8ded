import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { verifyChallengeToken } from '../../shared/lib/passkeys';
import { PasskeyServer } from '../../shared/lib/passkey-server';

export default async ({ req, res, log, error }: any) => {
  try {
    const body = JSON.parse(req.bodyRaw || '{}');
    const { userId: rawUserId, attestation, challengeToken, challenge } = body || {};
    const userId = String(rawUserId || '').trim().toLowerCase();
    
    if (!userId || !attestation || !challengeToken || !challenge) {
      return res.json({ error: 'userId, attestation, challenge and challengeToken required' }, 400);
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

    const att: any = attestation;
    const shapeErrors: string[] = [];
    if (typeof att !== 'object' || !att) shapeErrors.push('attestation not object');
    if (!att.id) shapeErrors.push('missing id');
    if (!att.rawId) shapeErrors.push('missing rawId');
    if (att.type !== 'public-key') shapeErrors.push('type not public-key');
    if (!att.response) shapeErrors.push('missing response');
    if (att.response && !att.response.clientDataJSON) shapeErrors.push('missing response.clientDataJSON');
    if (att.response && !att.response.attestationObject) shapeErrors.push('missing response.attestationObject');
    if (shapeErrors.length) {
      return res.json({ error: 'Malformed attestation', detail: shapeErrors }, 400);
    }

    const debug = process.env.WEBAUTHN_DEBUG === '1';

    let verification: any;
    try {
      verification = await verifyRegistrationResponse({
        response: attestation,
        expectedChallenge: challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (libErr) {
      const msg = (libErr as Error).message || String(libErr);
      return res.json({ 
        error: 'WebAuthn library verification threw', 
        detail: msg, 
        ...(debug ? { 
          attestationShape: Object.keys(attestation || {}), 
          responseKeys: attestation?.response ? Object.keys(attestation.response) : [], 
          idLength: attestation?.id?.length, 
          expectedOrigin: origin, 
          expectedRPID: rpID, 
          expectedChallenge: String(challenge).slice(0,8)+'...' 
        } : {}) 
      }, 400);
    }

    if (!verification?.verified) {
      return res.json({ 
        error: 'Registration verification failed', 
        detail: verification, 
        ...(debug ? { expectedOrigin: origin, expectedRPID: rpID, expectedChallenge: challenge.slice(0,8)+'...' } : {}) 
      }, 400);
    }

    const registrationInfo: any = (verification as any).registrationInfo;
    if (!registrationInfo) {
      return res.json({ error: 'Missing registrationInfo in verification result' }, 500);
    }

    const toBase64Url = (val: unknown): string | null => {
      if (!val) return null;
      if (typeof val === 'string') {
        return val;
      }
      const anyVal: any = val;
      if (typeof Buffer !== 'undefined' && (Buffer.isBuffer?.(anyVal) || anyVal instanceof Uint8Array)) {
        return Buffer.from(anyVal).toString('base64url');
      }
      if (anyVal instanceof ArrayBuffer) {
        return Buffer.from(new Uint8Array(anyVal)).toString('base64url');
      }
      return null;
    };

    const credObj = registrationInfo.credential || {};
    const credId = toBase64Url(credObj.id) || toBase64Url((registrationInfo as any).credentialID);
    const pubKey = toBase64Url(credObj.publicKey) || toBase64Url((registrationInfo as any).credentialPublicKey);

    if (!credId || !pubKey) {
      return res.json({ 
        error: 'Registration returned incomplete credential', 
        ...(debug ? { registrationInfoKeys: Object.keys(registrationInfo || {}), credentialKeys: Object.keys(credObj || {}) } : {}) 
      }, 500);
    }

    const server = new PasskeyServer();
    const result = await server.registerPasskey(userId, attestation, challenge, { rpID, origin });
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
