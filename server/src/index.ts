import Elysia, { type Context } from 'elysia';
import { config } from './config';
import { auth } from './lib/auth';
import { cors } from '@elysiajs/cors';
import staticPlugin from '@elysiajs/static';
import swagger from '@elysiajs/swagger';

const allowedOrigins = config.auth.trustedOrigins;

export const betterAuthView = (context: Context) => {
  const BETTER_AUTH_ACCEPT_METHODS = ['POST', 'GET'];
  // validate request method
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
  } else {
    context.error(405);
  }
};

const validateOrigin = (request: Request) => {
  const origin = request.headers.get('origin') || '';
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  return false;
};

const app = new Elysia()
  .use(
    cors({
      origin: validateOrigin,
      credentials: true,
    })
  )
  .use(
    staticPlugin({
      prefix: '/uploads',
      assets: 'uploads',
    })
  )
  .use(swagger())
  .group('/api', (app) => app.get('/hello', () => 'Hello World'))
  .all('/api/auth/*', betterAuthView)
  .listen(config.port);

console.log(`🦊 Elysia is running at ${config.url}`);

export type App = typeof app;
