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
import { sendMessage } from './modules/messages/sendMessage';
import { getConversations } from './modules/conversations/getConversations';
import { getConversationMessages } from './modules/conversations/getConversationMessages';
import { joinGroup } from './modules/conversations/joinGroup';
import { leaveGroup } from './modules/conversations/leaveGroup';
import { getSingleConversation } from './modules/conversations/getSingleConversation';
import { createRole } from './modules/roles/createRole';
import { getUserRoles } from './modules/roles/getUserRoles';
import { removeRole } from './modules/roles/removeRole';
import { assignRole } from './modules/roles/assignRole';
import { getNotifications } from './modules/notifications/getNotifications';
import { deleteAllNotifications } from './modules/notifications/deleteAllNotifications';
import { markNotificationRead } from './modules/notifications/markNotificationRead';
import { markAllNotificationsRead } from './modules/notifications/markAllNotificationsRead';
import { deleteNotification } from './modules/notifications/deleteNotification';
import { createChannel } from './modules/guilds/channels/createChannel';
import { updateChannel } from './modules/guilds/channels/updateChannel';
import { reorderChannel } from './modules/guilds/channels/reorderChannel';
import { createChannelInCategory } from './modules/guilds/channels/createChannelInCategory';
import { getSingleChannel } from './modules/guilds/channels/getSingleChannel';
import { getGuildChannels } from './modules/guilds/channels/getGuildChannels';
import { createCategory } from './modules/guilds/channels/createCategory';
import { deleteChannel } from './modules/guilds/channels/deleteChannel';

const userRouter = router({
  me,
  logout,
  register,
  login,
});

const friendRouter = router({
  acceptFriendRequest,
  declineFriendRequest,
  getAllFriends,
  getPendingFriendRequests,
  removeFriend,
});

const guildChannelRouter = router({
  createChannel,
  updateChannel,
  reorderChannel,
  createChannelInCategory,
  getSingleChannel,
  getGuildChannels,
  createCategory,
  deleteChannel,
});

const guildRouter = router({
  getAllGuilds,
  getSingleGuild,
  createGuild,
  deleteGuild,
  getGuildMembers,
  leaveGuild,
  updateGuild,
  guildChannel: guildChannelRouter,
});

const inviteRouter = router({
  getGuildInviteLinks,
  getGuildByInviteCode,
  useInviteLink,
  createInviteLink,
});

const conversationRouter = router({
  createConversation,
  createGroup,
  joinGroup,
  leaveGroup,
  getConversationMessages,
  getSingleConversation,
  getConversations,
});

const messageRouter = router({
  sendMessage,
});

const roleRouter = router({
  createRole,
  getUserRoles,
  removeRole,
  assignRole,
});

const notificationRouter = router({
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteAllNotifications,
  deleteNotification,
});

export const appRouter = router({
  user: userRouter,
  friend: friendRouter,
  guild: guildRouter,
  invite: inviteRouter,
  conversation: conversationRouter,
  message: messageRouter,
  role: roleRouter,
  notification: notificationRouter,
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
