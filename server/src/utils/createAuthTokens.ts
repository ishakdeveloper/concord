import { sign, verify } from 'jsonwebtoken';
import { DbUser } from '../database/schema';
import { Response } from 'express';
import { __prod__ } from '../constants/prod';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import db from '../database/db';
import { users } from '../database/schema';

export type RefreshTokenData = {
  userId: string;
  refreshTokenVersion?: number;
};

export type AccessTokenData = {
  userId: string;
};

const createAuthTokens = (
  user: DbUser
): { refreshToken: string; accessToken: string } => {
  const refreshToken = sign(
    { userId: user.id, refreshTokenVersion: user.refreshTokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: '30d',
    }
  );
  const accessToken = sign(
    { userId: user.id },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: '15min',
    }
  );

  return { refreshToken, accessToken };
};

const cookieOpts = {
  path: '/',
  httpOnly: true,
  secure: __prod__,
  domain: __prod__ ? `.${process.env.DOMAIN}` : 'localhost',
  maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 year
};

export const sendAuthCookies = (res: Response, user: DbUser) => {
  const { accessToken, refreshToken } = createAuthTokens(user);
  res.cookie('id', accessToken, cookieOpts);
  res.cookie('rid', refreshToken, cookieOpts);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie('id', cookieOpts);
  res.clearCookie('rid', cookieOpts);
};

export const checkTokens = async (
  accessToken: string,
  refreshToken: string
) => {
  try {
    // Try to verify access token first
    const data = <AccessTokenData>(
      verify(accessToken, process.env.ACCESS_TOKEN_SECRET!)
    );

    // Get user to return with valid access token
    const user = await db.query.users.findFirst({
      where: eq(users.id, data.userId),
    });

    return {
      userId: data.userId,
      user,
    };
  } catch (err) {
    // Access token verification failed, try refresh token
    if (!refreshToken) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    try {
      const refreshData = <RefreshTokenData>(
        verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!)
      );

      const user = await db.query.users.findFirst({
        where: eq(users.id, refreshData.userId),
      });

      if (
        !user ||
        user.refreshTokenVersion !== refreshData.refreshTokenVersion
      ) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Create new tokens without incrementing version
      const tokens = createAuthTokens(user);

      return {
        userId: refreshData.userId,
        user,
        tokens, // New tokens will be set as cookies
      };
    } catch (refreshErr) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
  }
};

export const sendAuthTokens = (res: Response, user: DbUser) => {
  const tokens = createAuthTokens(user);

  if (res.req?.headers['x-app-platform'] === 'react-native') {
    // For React Native, return tokens in response body
    return tokens;
  } else {
    // For web, set cookies
    sendAuthCookies(res, user);
    return null;
  }
};