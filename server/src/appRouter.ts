import * as trpcExpress from '@trpc/server/adapters/express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { __prod__ } from './constants/prod';
import { router, publicProcedure } from './trpc';
import { createContext } from './trpc';
import { me } from './modules/user/me';
import { logout } from './modules/user/logout';
import { register } from './modules/user/register';
import { login } from './modules/user/login';
import { getAllGuilds } from './modules/guilds/getAllGuilds';
import { getSingleGuild } from './modules/guilds/getSingleGuild';
import { createGuild } from './modules/guilds/createGuild';
import { deleteGuild } from './modules/guilds/deleteGuild';
import { getGuildMembers } from './modules/guilds/getGuildMembers';
import { leaveGuild } from './modules/guilds/leaveGuild';
import { updateGuild } from './modules/guilds/updateGuild';
import { acceptFriendRequest } from './modules/friends/acceptFriendRequest';
import { declineFriendRequest } from './modules/friends/declineFriendRequest';
import { getAllFriends } from './modules/friends/getAllFriends';
import { getPendingFriendRequests } from './modules/friends/getPendingFriendRequests';
import { removeFriend } from './modules/friends/removeFriend';
import { useInviteLink } from './modules/invites/useInviteLink';
import { getGuildByInviteCode } from './modules/invites/getGuildByInviteCode';
import { getGuildInviteLinks } from './modules/invites/getGuildInviteLinks';
import { createInviteLink } from './modules/invites/createInviteLink';
import { createConversation } from './modules/conversations/createConversation';
import { createGroup } from './modules/conversations/createGroup';

export const appRouter = router({
  me,
  logout,
  register,
  login,
  acceptFriendRequest,
  declineFriendRequest,
  getAllFriends,
  getPendingFriendRequests,
  removeFriend,
  getAllGuilds,
  getSingleGuild,
  createGuild,
  deleteGuild,
  getGuildMembers,
  leaveGuild,
  updateGuild,
  getGuildInviteLinks,
  getGuildByInviteCode,
  useInviteLink,
  createInviteLink,
  createConversation,
  createGroup,
  hello: publicProcedure.query(() => 'Hello World'),
});

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
