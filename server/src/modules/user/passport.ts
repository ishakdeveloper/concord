import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { users, accounts, DbUser } from '../../database/schema';
import { generateDiscriminator } from '../../utils/discriminator';

export const configurePassport = () => {
  // Discord Strategy
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        callbackURL: `${process.env.DOMAIN}/api/auth/discord/callback`,
        scope: ['identify', 'email'],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: any
      ) => {
        try {
          const existingAccount = await db.query.accounts.findFirst({
            where: eq(accounts.providerId, profile.id),
            with: {
              user: true,
            },
          });

          if (existingAccount) {
            return done(null, existingAccount.user);
          }

          const discriminator = await generateDiscriminator(profile.username);

          const [newUser] = await db
            .insert(users)
            .values({
              email: profile.email,
              name: profile.username,
              displayName: profile.username,
              discriminator,
              confirmed: true,
              status: 'offline',
              image: profile.avatar
                ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                : undefined,
              dateOfBirth: profile.birthday
                ? new Date(profile.birthday)
                : new Date('2000-01-01'),
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          await db.insert(accounts).values({
            userId: newUser.id,
            provider: 'discord',
            providerId: profile.id,
            providerEmail: profile.email,
            providerUsername: `${profile.username}#${profile.discriminator}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          return done(null, newUser);
        } catch (err) {
          console.error('Discord auth error:', err);
          return done(err as Error, undefined);
        }
      }
    )
  );

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.DOMAIN}/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: any
      ) => {
        try {
          const existingAccount = await db.query.accounts.findFirst({
            where: eq(accounts.providerId, profile.id),
            with: {
              user: true,
            },
          });

          if (existingAccount) {
            return done(null, existingAccount.user);
          }

          const discriminator = await generateDiscriminator(
            profile.displayName
          );

          const [newUser] = await db
            .insert(users)
            .values({
              email: profile.emails[0].value,
              name: profile.displayName,
              displayName: profile.displayName,
              discriminator,
              confirmed: true,
              status: 'offline',
              image: profile.photos?.[0]?.value,
              dateOfBirth: new Date('2000-01-01'),
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          await db.insert(accounts).values({
            userId: newUser.id,
            provider: 'google',
            providerId: profile.id,
            providerEmail: profile.emails[0].value,
            providerUsername: profile.displayName,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          return done(null, newUser);
        } catch (err) {
          console.error('Google auth error:', err);
          return done(err as Error, undefined);
        }
      }
    )
  );

  // GitHub Strategy
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        callbackURL: `${process.env.DOMAIN}/api/auth/github/callback`,
        scope: ['read:user', 'user:email'],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: any
      ) => {
        try {
          const existingAccount = await db.query.accounts.findFirst({
            where: eq(accounts.providerId, profile.id.toString()),
            with: {
              user: true,
            },
          });

          if (existingAccount) {
            return done(null, existingAccount.user);
          }

          // Get email from profile
          const email = profile._json.email;

          if (!email) {
            console.error('GitHub Profile:', profile);
            return done(new Error('No email found in GitHub profile'));
          }

          const discriminator = await generateDiscriminator(profile.username);

          const [newUser] = await db
            .insert(users)
            .values({
              email,
              name: profile.username,
              displayName: profile.displayName || profile.username,
              discriminator,
              confirmed: true,
              status: 'offline',
              image: profile._json.avatar_url,
              dateOfBirth: new Date('2000-01-01'),
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          await db.insert(accounts).values({
            userId: newUser.id,
            provider: 'github',
            providerId: profile.id.toString(),
            providerEmail: email,
            providerUsername: profile.username,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          return done(null, newUser);
        } catch (err) {
          console.error('GitHub auth error:', err);
          return done(err as Error, undefined);
        }
      }
    )
  );

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, (user as DbUser).id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
