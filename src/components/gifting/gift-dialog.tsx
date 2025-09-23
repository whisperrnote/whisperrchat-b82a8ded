import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Gift } from 'lucide-react';

interface GiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendGift: (amount: number) => void;
  recipientName: string;
}

const GIFT_AMOUNTS = [1, 5, 10, 20, 50];

export function GiftDialog({ open, onOpenChange, onSendGift, recipientName }: GiftDialogProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(GIFT_AMOUNTS[1]);

  const handleSendGift = () => {
    if (selectedAmount) {
      onSendGift(selectedAmount);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Send a Gift to {recipientName}
          </DialogTitle>
          <DialogDescription>
            Select an amount to send as a gift. This will be a simulated transaction on the blockchain.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedAmount?.toString()}
            onValueChange={(value) => setSelectedAmount(Number(value))}
            className="grid grid-cols-3 gap-4"
          >
            {GIFT_AMOUNTS.map((amount) => (
              <Label
                key={amount}
                htmlFor={`gift-amount-${amount}`}
                className={`flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                  selectedAmount === amount ? 'border-primary' : ''
                }`}
              >
                <RadioGroupItem value={amount.toString()} id={`gift-amount-${amount}`} className="sr-only" />
                <span className="text-2xl font-bold">${amount}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendGift} disabled={!selectedAmount}>
            Send Gift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
