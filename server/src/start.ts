import passport from 'passport';
import { configurePassport } from './modules/user/passport';
import { sendAuthCookies } from './utils/createAuthTokens';
import { DbUser } from './database/schema';
import { app } from './appRouter';

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
    (req, res) => {
      sendAuthCookies(res, req.user as DbUser);
      res.redirect(`${process.env.FRONTEND_URL}/me`);
    }
  );

  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
};
