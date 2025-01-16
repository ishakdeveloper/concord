'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

interface InvitePeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  guildId: string;
}

export const InvitePeopleModal = ({
  isOpen,
  onClose,
  guildId,
}: InvitePeopleModalProps) => {
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');

  const { data: invite } = trpc.invite.createInviteLink.useQuery(
    {
      guildId: guildId,
      maxUses: 0,
    },
    {
      enabled: isOpen && !!guildId,
    }
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && invite) {
      setInviteUrl(`${window.location.origin}/invite/${invite.inviteCode}`);
    }
  }, [invite]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite People</DialogTitle>
          <DialogDescription>
            Share this link with others to invite them to your server
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Input readOnly value={inviteUrl} className="flex-1" />
            <Button size="icon" onClick={handleCopy} className="shrink-0">
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Your invite link expires in 7 days
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
