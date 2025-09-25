import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Filter,
  Search,
  Gift,
  MessageCircle
} from 'lucide-react';

interface TransactionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'gift_sent' | 'gift_received';
  amount: string;
  currency: string;
  recipient?: string;
  sender?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  txHash?: string;
  message?: string;
  conversationId?: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'gift_sent',
    amount: '5.00',
    currency: 'ETH',
    recipient: 'alice.eth',
    status: 'confirmed',
    timestamp: '2025-01-20T14:30:00Z',
    txHash: '0x8f7d2a1b...',
    message: 'Happy Birthday! 🎉',
    conversationId: 'conv_1'
  },
  {
    id: '2',
    type: 'gift_received',
    amount: '2.50',
    currency: 'ETH',
    sender: 'bob.eth',
    status: 'confirmed',
    timestamp: '2025-01-19T09:15:00Z',
    txHash: '0x3c4b8e9a...',
    message: 'Thanks for the help!',
    conversationId: 'conv_2'
  },
  {
    id: '3',
    type: 'sent',
    amount: '10.00',
    currency: 'ETH',
    recipient: '0x742d35...6fc3e',
    status: 'pending',
    timestamp: '2025-01-20T16:45:00Z',
    txHash: '0x1a2b3c4d...',
  },
  {
    id: '4',
    type: 'gift_sent',
    amount: '1.00',
    currency: 'ETH',
    recipient: 'charlie.eth',
    status: 'failed',
    timestamp: '2025-01-18T11:20:00Z',
    message: 'Coffee money ☕',
    conversationId: 'conv_3'
  },
  {
    id: '5',
    type: 'received',
    amount: '7.25',
    currency: 'ETH',
    sender: 'dave.eth',
    status: 'confirmed',
    timestamp: '2025-01-17T13:10:00Z',
    txHash: '0x9e8f7d6c...',
  },
];

export function TransactionHistory({ open, onOpenChange }: TransactionHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'sent' | 'received' | 'gifts'>('all');
  const [search, setSearch] = useState('');

  const filteredTransactions = MOCK_TRANSACTIONS.filter((tx) => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'sent' && (tx.type === 'sent' || tx.type === 'gift_sent')) ||
      (filter === 'received' && (tx.type === 'received' || tx.type === 'gift_received')) ||
      (filter === 'gifts' && (tx.type === 'gift_sent' || tx.type === 'gift_received'));
    
    const matchesSearch = search === '' ||
      (tx.recipient && tx.recipient.toLowerCase().includes(search.toLowerCase())) ||
      (tx.sender && tx.sender.toLowerCase().includes(search.toLowerCase())) ||
      (tx.message && tx.message.toLowerCase().includes(search.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const getTransactionIcon = (tx: Transaction) => {
    if (tx.type === 'gift_sent' || tx.type === 'gift_received') {
      return <Gift className="h-4 w-4" />;
    }
    return tx.type === 'sent' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />;
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-400" />;
      case 'confirmed':
        return <CheckCircle className="h-3 w-3 text-green-400" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-400" />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'pending':
        return 'tx-status--pending';
      case 'confirmed':
        return 'tx-status--confirmed';
      case 'failed':
        return 'tx-status--failed';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-black via-zinc-900 to-violet-900/20 border-violet-500/20 backdrop-blur-xl max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="p-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            Transaction History
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-2">
          {/* Search and Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'sent' | 'received' | 'gifts')}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-violet-500 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
                <option value="gifts">Gifts</option>
              </select>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownLeft className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">Received</span>
              </div>
              <div className="text-white text-lg font-semibold">9.75 ETH</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-red-500/10 to-rose-600/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">Sent</span>
              </div>
              <div className="text-white text-lg font-semibold">16.00 ETH</div>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-600/10 border border-violet-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="h-4 w-4 text-violet-400" />
                <span className="text-sm text-violet-400">Gifts</span>
              </div>
              <div className="text-white text-lg font-semibold">8.50 ETH</div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-3 max-h-96 overflow-y-auto crypto-scrollbar">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">No transactions found</p>
                <p className="text-zinc-500 text-sm">Try adjusting your search or filter</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-xl bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 border border-zinc-700 hover:border-violet-500/30 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Transaction Icon */}
                    <div className={`p-2 rounded-full ${
                      tx.type === 'sent' || tx.type === 'gift_sent' 
                        ? 'bg-gradient-to-r from-red-500/20 to-rose-600/20 text-red-400'
                        : 'bg-gradient-to-r from-green-500/20 to-emerald-600/20 text-green-400'
                    }`}>
                      {getTransactionIcon(tx)}
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">
                          {tx.type === 'gift_sent' && 'Gift Sent'}
                          {tx.type === 'gift_received' && 'Gift Received'}
                          {tx.type === 'sent' && 'Transfer Sent'}
                          {tx.type === 'received' && 'Transfer Received'}
                        </span>
                        <Badge className={`text-xs ${getStatusColor(tx.status)}`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(tx.status)}
                            {tx.status}
                          </div>
                        </Badge>
                      </div>

                      {/* Recipient/Sender */}
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6 bg-gradient-to-r from-violet-500 to-purple-600">
                          <span className="text-xs text-white">
                            {(tx.recipient || tx.sender)?.charAt(0).toUpperCase()}
                          </span>
                        </Avatar>
                        <span className="text-zinc-300 text-sm">
                          {tx.type === 'sent' || tx.type === 'gift_sent' ? 'To: ' : 'From: '}
                          {tx.recipient || tx.sender}
                        </span>
                      </div>

                      {/* Message (for gifts) */}
                      {tx.message && (
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="h-3 w-3 text-zinc-400" />
                          <span className="text-zinc-400 text-sm italic">"{tx.message}"</span>
                        </div>
                      )}

                      {/* Date and Hash */}
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span>{formatDate(tx.timestamp)} at {formatTime(tx.timestamp)}</span>
                        {tx.txHash && (
                          <button className="flex items-center gap-1 hover:text-violet-400 transition-colors">
                            <span>{tx.txHash.slice(0, 8)}...</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        tx.type === 'sent' || tx.type === 'gift_sent' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {tx.type === 'sent' || tx.type === 'gift_sent' ? '-' : '+'}
                        {tx.amount} {tx.currency}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-zinc-700">
            <p className="text-zinc-400 text-sm">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} shown
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-violet-400 hover:text-white hover:bg-violet-500/20"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}