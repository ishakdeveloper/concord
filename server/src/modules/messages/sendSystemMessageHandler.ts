import { messages } from '../../database/schema';

import db from '../../database/db';

export const sendSystemMessageHandler = async (
  conversationId: string,
  message: string,
  authorId: string
) => {
  const systemMessage = await db.insert(messages).values({
    content: message,
    conversationId,
    isSystem: true,
    authorId: authorId,
  });

  return systemMessage;
};
