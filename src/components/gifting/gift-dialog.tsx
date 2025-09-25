import { useState } from 'react';
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
import { Gift, Coins, Shield, Zap } from 'lucide-react';

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
      <DialogContent className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 bg-gradient-to-br from-black via-zinc-900 to-violet-900/20 border-violet-500/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600">
              <Gift className="h-5 w-5 text-white" />
            </div>
            Send Crypto Gift to {recipientName}
          </DialogTitle>
          <DialogDescription className="text-zinc-300">
            Send a secure, blockchain-verified gift payment. Transaction will be encrypted end-to-end and recorded on-chain.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-600/10 border border-violet-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">Secure Transaction</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>• End-to-end encrypted</span>
              <span>• Blockchain anchored</span>
              <span>• Instant delivery</span>
            </div>
          </div>

          <RadioGroup
            value={selectedAmount?.toString()}
            onValueChange={(value) => setSelectedAmount(Number(value))}
            className="grid grid-cols-3 gap-3"
          >
            {GIFT_AMOUNTS.map((amount, index) => (
              <Label
                key={amount}
                htmlFor={`gift-amount-${amount}`}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedAmount === amount 
                    ? 'border-violet-500 bg-gradient-to-br from-violet-500/20 to-purple-600/20 shadow-lg shadow-violet-500/25' 
                    : 'border-zinc-700 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 hover:border-violet-500/50 hover:bg-gradient-to-br hover:from-violet-500/10 hover:to-purple-600/10'
                }`}
              >
                <RadioGroupItem value={amount.toString()} id={`gift-amount-${amount}`} className="sr-only" />
                <div className="flex items-center gap-2 mb-2">
                  <Coins className={`h-5 w-5 ${selectedAmount === amount ? 'text-violet-400' : 'text-zinc-400'}`} />
                  <span className={`text-2xl font-bold ${selectedAmount === amount ? 'text-white' : 'text-zinc-200'}`}>
                    ${amount}
                  </span>
                </div>
                {index === 1 && (
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-medium">Popular</span>
                  </div>
                )}
                {selectedAmount === amount && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-violet-500 rounded-full border-2 border-white"></div>
                )}
              </Label>
            ))}
          </RadioGroup>

          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 border border-zinc-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Transaction Fee:</span>
              <span className="text-white font-medium">Free</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-zinc-400">Estimated Delivery:</span>
              <span className="text-green-400 font-medium">Instant</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendGift} 
            disabled={!selectedAmount}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 transition-all duration-200"
          >
            <Gift className="h-4 w-4 mr-2" />
            Send ${selectedAmount} Gift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}