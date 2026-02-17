import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSendMessage } from '../../hooks/useQueries';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { MessageCircle } from 'lucide-react';

interface ContactSellerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: bigint;
  listingTitle: string;
}

export default function ContactSellerDialog({ open, onOpenChange, listingId, listingTitle }: ContactSellerDialogProps) {
  const [message, setMessage] = useState('');
  const sendMessage = useSendMessage();
  const { data: userProfile } = useGetCallerUserProfile();
  const { identity, login } = useInternetIdentity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      login();
      return;
    }
    if (message.trim() && userProfile) {
      await sendMessage.mutateAsync({
        listingId,
        senderName: userProfile.name,
        messageText: message.trim(),
      });
      setMessage('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contact Seller
          </DialogTitle>
          <DialogDescription>Send a message about "{listingTitle}"</DialogDescription>
        </DialogHeader>
        {!identity ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-muted-foreground">Please sign in to contact the seller.</p>
            <Button onClick={login}>Sign In</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I'm interested in this property..."
                rows={5}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={sendMessage.isPending || !message.trim()} className="flex-1">
                {sendMessage.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
