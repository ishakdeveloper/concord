import { sign, verify } from 'jsonwebtoken';
import { DbUser, sessions, users } from '../database/schema';
import { TRPCError } from '@trpc/server';
import { and, eq, sql } from 'drizzle-orm';
import db from '../database/db';
import { getClientIp } from 'request-ip';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';
import { Response, Request as ExpressRequest } from 'express';

export const createAuthTokens = async (
  user: DbUser,
  req: ExpressRequest
): Promise<{
  refreshToken: string;
  accessToken: string;
  sessionId: string;
}> => {
  // Parse user agent for device info
  const parser = new UAParser(req.headers['user-agent'] || '');
  const ip = getClientIp(req as any);
  const geo = ip ? geoip.lookup(ip) : null;
  const location = geo ? `${geo.city}, ${geo.country}` : undefined;

  const deviceInfo = {
    deviceName: `${parser.getBrowser().name || 'Unknown'} on ${parser.getOS().name || 'Unknown'}`,
    deviceType: parser.getDevice().type || 'browser',
    clientName: parser.getBrowser().name || 'Unknown',
    clientVersion: parser.getBrowser().version || 'Unknown',
    osName: parser.getOS().name || 'Unknown',
    osVersion: parser.getOS().version || 'Unknown',
    ipAddress: ip,
    location,
  };

  // Generate a consistent device ID
  const deviceId =
    `${deviceInfo.deviceType}-${deviceInfo.osName}-${deviceInfo.clientName}`.toLowerCase();

  // Try to find existing non-revoked session for this device
  let session = await db.query.sessions.findFirst({
    where: and(
      eq(sessions.userId, user.id),
      eq(sessions.deviceId, deviceId),
      eq(sessions.isRevoked, false)
    ),
  });

  if (session) {
    // Update existing session
    [session] = await db
      .update(sessions)
      .set({
        lastActive: new Date(),
        ...deviceInfo, // Update device info in case it changed
      })
      .where(eq(sessions.id, session.id))
      .returning();
  } else {
    // Create new session only if none exists for this device
    [session] = await db
      .insert(sessions)
      .values({
        userId: user.id,
        deviceId,
        ...deviceInfo,
        refreshTokenVersion: 0,
        lastActive: new Date(),
      })
      .returning();
  }

  // Create tokens using session
  const refreshToken = sign(
    {
      userId: user.id,
      sessionId: session.id,
      tokenVersion: session.refreshTokenVersion,
    },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: '30d' }
  );

  const accessToken = sign(
    {
      userId: user.id,
      sessionId: session.id,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: '15min' }
  );

  return { refreshToken, accessToken, sessionId: session.id };
};

export const checkTokens = async (
  accessToken: string,
  refreshToken: string
) => {
  // If no access token provided, go straight to refresh flow
  if (!accessToken) {
    return await handleRefreshToken(refreshToken);
  }

  try {
    const data = verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
      sessionId: string;
    };

    // Verify session is still valid
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, data.sessionId),
      with: {
        user: true,
      },
    });

    if (!session || session.isRevoked) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // Update last active
    await db
      .update(sessions)
      .set({ lastActive: new Date() })
      .where(eq(sessions.id, data.sessionId));

    return {
      userId: data.userId,
      sessionId: data.sessionId,
      user: session?.user,
      tokens: undefined,
    };
  } catch (err) {
    if (!refreshToken) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return await handleRefreshToken(refreshToken);
  }
};

// Extract refresh token logic into separate function
const handleRefreshToken = async (refreshToken: string) => {
  try {
    const data = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
      userId: string;
      sessionId: string;
      tokenVersion: number;
    };

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, data.sessionId),
      with: {
        user: true,
      },
    });

    if (
      !session ||
      session.isRevoked ||
      session.refreshTokenVersion !== data.tokenVersion
    ) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    // Increment token version and create new tokens
    const [updatedSession] = await db
      .update(sessions)
      .set({
        refreshTokenVersion: session.refreshTokenVersion + 1,
        lastActive: new Date(),
      })
      .where(eq(sessions.id, data.sessionId))
      .returning();

    const tokens = {
      accessToken: sign(
        { userId: data.userId, sessionId: data.sessionId },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: '15min' }
      ),
      refreshToken: sign(
        {
          userId: data.userId,
          sessionId: data.sessionId,
          tokenVersion: updatedSession.refreshTokenVersion,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: '30d' }
      ),
    };

    return {
      userId: data.userId,
      sessionId: data.sessionId,
      tokens,
      user: session?.user,
    };
  } catch (refreshErr) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
};

export const revokeSession = async (sessionId: string) => {
  await db
    .update(sessions)
    .set({
      isRevoked: true,
      updatedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));
};

export const revokeAllUserSessions = async (userId: string) => {
  await db
    .update(sessions)
    .set({
      isRevoked: true,
      updatedAt: new Date(),
    })
    .where(eq(sessions.userId, userId));
};

const cookieOpts = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  domain:
    process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'localhost',
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
};

export const sendAuthCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string }
) => {
  res.cookie('id', tokens.accessToken, cookieOpts);
  res.cookie('rid', tokens.refreshToken, cookieOpts);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie('id', cookieOpts);
  res.clearCookie('rid', cookieOpts);
};

export const incrementTokenVersion = async (userId: string) => {
  await db
    .update(users)
    .set({
      refreshTokenVersion: sql`${users.refreshTokenVersion} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
};
