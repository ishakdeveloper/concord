import { UserState, useUserStore } from '@/stores/useUserStore';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, useState } from 'react';
import { MessageItem } from './MessageItem';

interface ChannelChatAreaProps {
  header: React.ReactNode;
  messages: any[];
  onSendMessage: (content: string) => Promise<void>;
  inputPlaceholder: string;
  chatId: string;
  showUserProfile?: boolean;
  rightSidebar?: React.ReactNode;
  //   socketPayload?: {
  //     guild_id?: string;
  //     channel_id: string;
  //   };
}

export const ChannelChatArea = ({
  header,
  messages,
  onSendMessage,
  inputPlaceholder,
  chatId,
  showUserProfile = false,
  rightSidebar,
  //   socketPayload,
}: ChannelChatAreaProps) => {
  const currentUser = useUserStore((state) => state.user);
  const [message, setMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    await onSendMessage(message);
    setMessage('');

    scrollToBottom();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatId, currentUser?.id]);

  const handleStartTyping = () => {
    console.log('start typing');
    setTypingUsers((prev) => ({
      ...prev,
      [currentUser?.id || '']: currentUser?.id || '',
    }));
  };

  return (
    <div className="flex flex-grow relative">
      <div className="flex-grow flex flex-col">
        {header}
        <ScrollArea className="flex-grow p-4">
          <div className="flex flex-col-reverse">
            {messages?.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                currentUser={currentUser as UserState}
                showUserProfile={showUserProfile}
              />
            ))}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        <div className="p-4 border-t">
          {Object.keys(typingUsers).length > 0 && (
            <div className="text-sm text-muted-foreground mb-2">
              {Object.keys(typingUsers).length === 1
                ? 'Someone is typing...'
                : 'Several people are typing...'}
            </div>
          )}
          <form onSubmit={handleSendMessage}>
            <Input
              placeholder={inputPlaceholder}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleStartTyping();
              }}
              required
              minLength={1}
            />
          </form>
        </div>
      </div>
      {rightSidebar}
    </div>
  );
};

export default ChannelChatArea;
