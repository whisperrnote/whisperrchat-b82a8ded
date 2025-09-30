import { Client, Users, ID, Query } from 'node-appwrite';
import { ethers } from 'ethers';

export default async ({ req, res, log, error }: any) => {
  try {
    const { email, address, signature, message } = JSON.parse(req.bodyRaw || '{}');
    
    if (!email || !address || !signature || !message) {
      return res.json({ error: 'Missing required fields' }, 400);
    }

    const expectedMessage = `Sign this message to authenticate: ${message}`;
    
    const isValidSignature = await verifySignature(expectedMessage, signature, address);
    
    if (!isValidSignature) {
      return res.json({ error: 'Invalid signature' }, 401);
    }

    const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.APPWRITE_PROJECT || process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    const apiKey = process.env.APPWRITE_API_KEY;
    
    if (!endpoint || !project || !apiKey) {
      error('Server not configured: missing endpoint, project, or API key');
      return res.json({ error: 'Server not configured' }, 500);
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(project)
      .setKey(apiKey);

    const users = new Users(client);
    const normalizedEthAddress = normalizeEthAddress(address);
    
    const userId = ID.unique();
    
    let existingUserId = userId;
    try {
      const existingUsers = await users.list([Query.equal('email', email)]);
      if ((existingUsers as any).total > 0 && (existingUsers as any).users?.length > 0) {
        const existing = (existingUsers as any).users[0];
        existingUserId = existing.$id;
        const existingWallet = (existing.prefs?.walletEth as string | undefined)?.toLowerCase();
        const hasPasskey = Boolean((existing.prefs as any)?.passkey_credentials);

        if (hasPasskey && !existingWallet) {
          return res.json(
            { error: 'Account already connected with passkey. Sign in with passkey to link wallet.' },
            403
          );
        }
        if (existingWallet && existingWallet !== normalizedEthAddress) {
          return res.json({ error: 'Email already bound to a different wallet' }, 403);
        }
        if (!existingWallet) {
          await users.updatePrefs(existingUserId, { ...(existing.prefs || {}), walletEth: normalizedEthAddress });
        }
      } else {
        const created = await users.create(userId, email);
        existingUserId = (created as any).$id || userId;
        await users.updatePrefs(existingUserId, { walletEth: normalizedEthAddress });
      }
    } catch (_error: unknown) {
      const created = await users.create(userId, email);
      existingUserId = (created as any).$id || userId;
      try { await users.updatePrefs(existingUserId, { walletEth: normalizedEthAddress }); } catch { /* ignore */ }
    }

    const token = await users.createToken(existingUserId);
    
    log(`Custom token created for user: ${existingUserId}`);
    
    return res.json({ 
      userId: existingUserId, 
      secret: token.secret 
    });

  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Authentication failed';
    error(`Custom token error: ${errorMessage}`);
    return res.json({ error: errorMessage }, 500);
  }
};

async function verifySignature(message: string, signature: string, address: string): Promise<boolean> {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (_error: unknown) {
    return false;
  }
}

function normalizeEthAddress(address: string): string {
  try {
    return (ethers.getAddress(address)).toLowerCase();
  } catch (_e) {
    return (address || '').trim().toLowerCase();
  }
}
