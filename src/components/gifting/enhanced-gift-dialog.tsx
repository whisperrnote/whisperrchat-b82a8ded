import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Gift, Coins, QrCode, Send, Sparkles, Crown, Zap } from 'lucide-react';
import { giftingService, type Gift as GiftType } from '@/lib/appwrite/services/gifting.service';
import { QRCodeDialog } from '@/components/qr/qr-code-dialog';
import { toast } from 'sonner';

interface EnhancedGiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientUsername?: string;
  recipientWallet?: string;
  onSendGift?: (giftId: string, message?: string) => Promise<void>;
  onSendCrypto?: (amount: string, token: string, chain: string) => Promise<void>;
}

export function EnhancedGiftDialog({
  open,
  onOpenChange,
  recipientUsername,
  recipientWallet,
  onSendGift,
  onSendCrypto,
}: EnhancedGiftDialogProps) {
  const [activeTab, setActiveTab] = useState('gifts');
  const [selectedGift, setSelectedGift] = useState<GiftType | null>(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQRCodeData] = useState('');
  const [sending, setSending] = useState(false);
  const [filterRarity, setFilterRarity] = useState<string>('all');

  const gifts = giftingService.getAvailableGifts();
  const chains = giftingService.getSupportedChains();
  const tokens = giftingService.getPopularTokens(selectedChain);

  const filteredGifts = filterRarity === 'all'
    ? gifts
    : gifts.filter(g => g.rarity === filterRarity);

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-600';
      case 'rare': return 'bg-blue-600';
      case 'epic': return 'bg-purple-600';
      case 'legendary': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getRarityIcon = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="w-3 h-3" />;
      case 'epic': return <Zap className="w-3 h-3" />;
      case 'rare': return <Sparkles className="w-3 h-3" />;
      default: return null;
    }
  };

  const handleSendGift = async () => {
    if (!selectedGift || !onSendGift) return;

    setSending(true);
    try {
      await onSendGift(selectedGift.id, giftMessage);
      toast.success(`Sent ${selectedGift.name} ${selectedGift.emoji}!`);
      onOpenChange(false);
      setSelectedGift(null);
      setGiftMessage('');
    } catch (error) {
      toast.error('Failed to send gift');
      console.error('Gift send error:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendCrypto = async () => {
    if (!cryptoAmount || !onSendCrypto) return;

    setSending(true);
    try {
      await onSendCrypto(cryptoAmount, selectedToken, selectedChain);
      toast.success(`Sent ${cryptoAmount} ${selectedToken}!`);
      onOpenChange(false);
      setCryptoAmount('');
    } catch (error) {
      toast.error('Failed to send crypto');
      console.error('Crypto send error:', error);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateQRCode = () => {
    if (!recipientWallet) {
      toast.error('Recipient wallet address not available');
      return;
    }

    const qrData = giftingService.generatePaymentQRCode({
      recipientAddress: recipientWallet,
      amount: cryptoAmount || undefined,
      token: selectedToken,
      chain: selectedChain,
      recipientUsername,
    });

    setQRCodeData(qrData);
    setShowQRCode(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl bg-gray-900/95 backdrop-blur-xl border-gray-800 max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-violet-400" />
              Send Gift or Crypto
              {recipientUsername && <span className="text-gray-400">to @{recipientUsername}</span>}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose a gift or send cryptocurrency directly
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="gifts" className="data-[state=active]:bg-violet-600">
                <Gift className="w-4 h-4 mr-2" />
                Gifts
              </TabsTrigger>
              <TabsTrigger value="crypto" className="data-[state=active]:bg-violet-600">
                <Coins className="w-4 h-4 mr-2" />
                Crypto
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gifts" className="space-y-4 mt-4">
              {/* Rarity Filter */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={filterRarity === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterRarity('all')}
                  className="text-xs"
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filterRarity === 'common' ? 'default' : 'outline'}
                  onClick={() => setFilterRarity('common')}
                  className="text-xs"
                >
                  Common
                </Button>
                <Button
                  size="sm"
                  variant={filterRarity === 'rare' ? 'default' : 'outline'}
                  onClick={() => setFilterRarity('rare')}
                  className="text-xs"
                >
                  Rare
                </Button>
                <Button
                  size="sm"
                  variant={filterRarity === 'epic' ? 'default' : 'outline'}
                  onClick={() => setFilterRarity('epic')}
                  className="text-xs"
                >
                  Epic
                </Button>
                <Button
                  size="sm"
                  variant={filterRarity === 'legendary' ? 'default' : 'outline'}
                  onClick={() => setFilterRarity('legendary')}
                  className="text-xs"
                >
                  Legendary
                </Button>
              </div>

              {/* Gift Grid */}
              <ScrollArea className="h-[300px] w-full">
                <div className="grid grid-cols-4 gap-3 pr-4">
                  {filteredGifts.map((gift) => (
                    <button
                      key={gift.id}
                      onClick={() => setSelectedGift(gift)}
                      className={`
                        relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 
                        transition-all hover:scale-105
                        ${selectedGift?.id === gift.id
                          ? 'border-violet-500 bg-violet-500/20'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                        }
                      `}
                    >
                      <span className="text-3xl">{gift.emoji}</span>
                      <span className="text-xs text-white font-medium text-center">
                        {gift.name}
                      </span>
                      <Badge className={`${getRarityColor(gift.rarity)} text-xs px-2 py-0 flex items-center gap-1`}>
                        {getRarityIcon(gift.rarity)}
                        {gift.value}
                      </Badge>
                    </button>
                  ))}
                </div>
              </ScrollArea>

              {/* Selected Gift Info */}
              {selectedGift && (
                <div className="space-y-3 p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedGift.emoji}</span>
                    <div>
                      <h3 className="text-white font-semibold">{selectedGift.name}</h3>
                      <Badge className={getRarityColor(selectedGift.rarity)}>
                        {selectedGift.rarity?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="giftMessage" className="text-gray-300">
                      Optional Message
                    </Label>
                    <Input
                      id="giftMessage"
                      placeholder="Add a message..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>

                  <Button
                    onClick={handleSendGift}
                    disabled={sending}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sending ? 'Sending...' : `Send ${selectedGift.name}`}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="crypto" className="space-y-4 mt-4">
              <div className="space-y-4">
                {/* Chain Selection */}
                <div className="space-y-2">
                  <Label htmlFor="chain" className="text-gray-300">
                    Blockchain
                  </Label>
                  <Select value={selectedChain} onValueChange={setSelectedChain}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {chains.map((chain) => (
                        <SelectItem key={chain.id} value={chain.id}>
                          {chain.name} ({chain.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Token Selection */}
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-gray-300">
                    Token
                  </Label>
                  <Select value={selectedToken} onValueChange={setSelectedToken}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {tokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          {token.symbol} - {token.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-gray-300">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.000001"
                    placeholder="0.00"
                    value={cryptoAmount}
                    onChange={(e) => setCryptoAmount(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSendCrypto}
                    disabled={!cryptoAmount || sending}
                    className="flex-1 bg-violet-600 hover:bg-violet-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sending ? 'Sending...' : 'Send Now'}
                  </Button>
                  <Button
                    onClick={handleGenerateQRCode}
                    variant="outline"
                    className="flex-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR
                  </Button>
                </div>

                {/* Info Text */}
                <p className="text-xs text-gray-500 text-center">
                  Generate a QR code for easy scanning and payment
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <QRCodeDialog
        open={showQRCode}
        onOpenChange={setShowQRCode}
        data={qrCodeData}
        title="Payment QR Code"
        description={`Scan to send ${cryptoAmount} ${selectedToken} on ${selectedChain}`}
      />
    </>
  );
}
