import * as trpcExpress from '@trpc/server/adapters/express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { __prod__ } from './constants/prod';
import { createContext } from './trpc';
import { appRouter } from './modules/manifest';
export const app = express();

app.use(
  '/trpc',
  cors({
    maxAge: __prod__ ? 86400 : undefined,
    credentials: true,
    origin: process.env.FRONTEND_URL,
  }),
  cookieParser(),
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError(opts) {
      const { error } = opts;
      console.error('Error:', error);
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        console.log('Internal server error');
      }
    },
  })
);

export type AppRouter = typeof appRouter;
