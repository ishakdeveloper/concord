const validateConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    const required = [
      'BETTER_AUTH_SECRET',
      'DISCORD_CLIENT_ID',
      'DISCORD_CLIENT_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET',
    ];

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }
};

validateConfig();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  url: process.env.URL || 'http://localhost:3001',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/concord_dev',
  },
  auth: {
    secret: process.env.BETTER_AUTH_SECRET || 'development-secret',
    trustedOrigins: (
      process.env.ALLOWED_ORIGINS || 'http://localhost:3000'
    ).split(','),
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
};
