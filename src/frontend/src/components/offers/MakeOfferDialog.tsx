import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSubmitOffer } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { HandCoins } from 'lucide-react';
import type { Listing } from '../../backend';
import { generateOfferOptions, formatINR } from '../../utils/offers';

interface MakeOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing;
}

export default function MakeOfferDialog({ open, onOpenChange, listing }: MakeOfferDialogProps) {
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [message, setMessage] = useState('');
  const submitOffer = useSubmitOffer();
  const { identity, login } = useInternetIdentity();

  const offerOptions = generateOfferOptions(listing.quotedPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      login();
      return;
    }
    const selectedOffer = offerOptions[selectedOption];
    await submitOffer.mutateAsync({
      listingId: listing.id,
      amount: selectedOffer.amount,
      currency: listing.currency,
      message: message.trim() || `Offer for ${listing.title}`,
    });
    setMessage('');
    setSelectedOption(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Make an Offer
          </DialogTitle>
          <DialogDescription>
            Choose an offer amount for "{listing.title}"
          </DialogDescription>
        </DialogHeader>
        {!identity ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-muted-foreground">Please sign in to make an offer.</p>
            <Button onClick={login}>Sign In</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Select Offer Amount</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Listed Price: <span className="font-semibold">{formatINR(listing.quotedPrice)}</span>
              </div>
              <RadioGroup value={selectedOption.toString()} onValueChange={(v) => setSelectedOption(Number(v))}>
                {offerOptions.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      <div className="font-semibold">{formatINR(option.amount)}</div>
                      <div className="text-xs text-muted-foreground">{option.label}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer-message">Message (Optional)</Label>
              <Textarea
                id="offer-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message with your offer..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={submitOffer.isPending} className="flex-1">
                {submitOffer.isPending ? 'Submitting...' : 'Submit Offer'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
