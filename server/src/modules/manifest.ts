import { me } from './user/me';
import { logout } from './user/logout';
import { register } from './user/register';
import { login } from './user/login';
import { getAllGuilds } from './guilds/getAllGuilds';
import { getSingleGuild } from './guilds/getSingleGuild';
import { createGuild } from './guilds/createGuild';
import { deleteGuild } from './guilds/deleteGuild';
import { getGuildMembers } from './guilds/getGuildMembers';
import { leaveGuild } from './guilds/leaveGuild';
import { updateGuild } from './guilds/updateGuild';
import { acceptFriendRequest } from './friends/acceptFriendRequest';
import { declineFriendRequest } from './friends/declineFriendRequest';
import { getAllFriends } from './friends/getAllFriends';
import { getPendingFriendRequests } from './friends/getPendingFriendRequests';
import { removeFriend } from './friends/removeFriend';
import { useInviteLink } from './invites/useInviteLink';
import { getGuildByInviteCode } from './invites/getGuildByInviteCode';
import { getGuildInviteLinks } from './invites/getGuildInviteLinks';
import { createInviteLink } from './invites/createInviteLink';
import { createConversation } from './conversations/createConversation';
import { createGroup } from './conversations/createGroup';
import { sendMessage } from './messages/sendMessage';
import { getConversations } from './conversations/getConversations';
import { getConversationMessages } from './conversations/getConversationMessages';
import { joinGroup } from './conversations/joinGroup';
import { leaveGroup } from './conversations/leaveGroup';
import { getSingleConversation } from './conversations/getSingleConversation';
import { createRole } from './roles/createRole';
import { getUserRoles } from './roles/getUserRoles';
import { removeRole } from './roles/removeRole';
import { assignRole } from './roles/assignRole';
import { getNotifications } from './notifications/getNotifications';
import { deleteAllNotifications } from './notifications/deleteAllNotifications';
import { markNotificationRead } from './notifications/markNotificationRead';
import { markAllNotificationsRead } from './notifications/markAllNotificationsRead';
import { deleteNotification } from './notifications/deleteNotification';
import { createChannel } from './guilds/channels/createChannel';
import { updateChannel } from './guilds/channels/updateChannel';
import { reorderChannel } from './guilds/channels/reorderChannel';
import { createChannelInCategory } from './guilds/channels/createChannelInCategory';
import { getSingleChannel } from './guilds/channels/getSingleChannel';
import { getGuildChannels } from './guilds/channels/getGuildChannels';
import { createCategory } from './guilds/channels/createCategory';
import { deleteChannel } from './guilds/channels/deleteChannel';
import { router } from '../trpc';
import { sendFriendRequest } from './friends/sendFriendRequest';
import { getGuildMembersAndRoles } from './guilds/getGuildMembersAndRoles';
import { addMembers } from './conversations/addMembers';

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
  sendFriendRequest,
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
  getGuildMembersAndRoles,
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
  addMembers,
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
});
