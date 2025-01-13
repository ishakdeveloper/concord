import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { users, accounts, DbUser } from '../../database/schema';
import { generateDiscriminator } from '../../utils/discriminator';

export const configurePassport = () => {
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
          // 1. Check if we already have an account for this Discord user
          const existingAccount = await db.query.accounts.findFirst({
            where: eq(accounts.providerId, profile.id),
            with: {
              user: true,
            },
          });

          if (existingAccount) {
            return done(null, existingAccount.user);
          }

          // 2. If no account exists, create new user and account
          const discriminator = await generateDiscriminator(profile.username);

          const [newUser] = await db
            .insert(users)
            .values({
              email: profile.email,
              name: profile.username,
              displayName: profile.username, // Auto-set displayName same as name
              discriminator,
              confirmed: true, // Auto-confirm OAuth users
              status: 'offline',
              image: profile.avatar
                ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                : undefined,
              dateOfBirth: profile.birthday
                ? new Date(profile.birthday)
                : new Date('2000-01-01'), // Default date
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          // 3. Create the Discord account link
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
