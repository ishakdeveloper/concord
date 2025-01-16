import passport from 'passport';
import { configurePassport } from './modules/user/passport';
import { sendAuthCookies } from './utils/createAuthTokens';
import { DbUser } from './database/schema';
import { app } from './appRouter';
import path from 'path';
import express from 'express';
import { createAuthTokens } from './utils/createAuthTokens';

export const startServer = async () => {
  app.use(passport.initialize());
  configurePassport();

  app.get(
    '/api/auth/discord',
    passport.authenticate('discord', { session: false })
  );

  app.get(
    '/api/auth/discord/callback',
    passport.authenticate('discord', {
      session: false,
      failureRedirect: '/login',
    }),
    async (req, res) => {
      if (!req.user) {
        return res.redirect('/login?error=auth-failed');
      }

      const tokens = await createAuthTokens(req.user as DbUser, req);
      sendAuthCookies(res, tokens);
      res.redirect(`${process.env.FRONTEND_URL}/channels/me`);
    }
  );

  app.get(
    '/api/auth/github',
    passport.authenticate('github', {
      session: false,
      scope: ['user:email'],
    })
  );

  app.get(
    '/api/auth/github/callback',
    passport.authenticate('github', {
      session: false,
      failureRedirect: '/login',
    }),
    async (req, res) => {
      if (!req.user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=auth-failed`
        );
      }

      const tokens = await createAuthTokens(req.user as DbUser, req);
      sendAuthCookies(res, tokens);
      res.redirect(`${process.env.FRONTEND_URL}/channels/me`);
    }
  );

  app.get(
    '/api/auth/google',
    passport.authenticate('google', {
      session: false,
      scope: ['profile', 'email'],
    })
  );

  app.get(
    '/api/auth/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: '/login',
    }),
    async (req, res) => {
      if (!req.user) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=auth-failed`
        );
      }

      const tokens = await createAuthTokens(req.user as DbUser, req);
      sendAuthCookies(res, tokens);
      res.redirect(`${process.env.FRONTEND_URL}/channels/me`);
    }
  );

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
};
