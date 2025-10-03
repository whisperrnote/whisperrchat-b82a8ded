import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  MessageSquare,
  User,
  Hash,
  Clock,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchResultType = 'message' | 'user' | 'conversation';

interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  timestamp?: string;
  unread?: boolean;
  online?: boolean;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Mock recent searches
  const recentSearches = [
    'alice.eth',
    'Payment received',
    'NFT drop',
  ];

  // Mock trending
  const trending = [
    { text: 'Web3 Gaming', icon: TrendingUp },
    { text: 'DeFi Updates', icon: Zap },
    { text: 'NFT Marketplace', icon: Hash },
  ];

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setResults([]);
      setSelectedIndex(0);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    
    // Mock search results
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'user',
          title: 'alice.eth',
          subtitle: 'Online now',
          online: true,
        },
        {
          id: '2',
          type: 'conversation',
          title: 'Web3 Developers',
          subtitle: '45 members',
        },
        {
          id: '3',
          type: 'message',
          title: 'Payment confirmation',
          subtitle: 'from bob.eth',
          timestamp: '2h ago',
        },
      ].filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setResults(mockResults);
      setLoading(false);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelectResult(results[selectedIndex]);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    console.log('Selected:', result);
    // TODO: Navigate to the selected result
    onOpenChange(false);
  };

  const getResultIcon = (type: SearchResultType) => {
    switch (type) {
      case 'user':
        return User;
      case 'conversation':
        return MessageSquare;
      case 'message':
        return Hash;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 bg-gray-900/95 backdrop-blur-xl border-gray-800 overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search messages, users, groups..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="pl-12 pr-4 h-12 bg-gray-800/50 border-gray-700 text-white text-base placeholder:text-gray-500 focus-visible:ring-violet-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {!query ? (
            <div className="p-4 space-y-6">
              {/* Recent Searches */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-400">Recent</h3>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(search)}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trending */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-medium text-gray-400">Trending</h3>
                </div>
                <div className="space-y-1">
                  {trending.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(item.text)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-violet-400" />
                      <span className="text-sm text-gray-300">{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result, index) => {
                const Icon = getResultIcon(result.type);
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                      isSelected ? 'bg-violet-600/20' : 'hover:bg-gray-800'
                    )}
                  >
                    {result.type === 'user' ? (
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-violet-600">
                            {result.title[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {result.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                        )}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">
                          {result.title}
                        </p>
                        {result.unread && (
                          <Badge className="bg-violet-600 text-white text-xs px-1.5 py-0">
                            New
                          </Badge>
                        )}
                      </div>
                      {result.subtitle && (
                        <p className="text-xs text-gray-400 truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    
                    {result.timestamp && (
                      <span className="text-xs text-gray-500">
                        {result.timestamp}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Search className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400">No results found</p>
              <p className="text-sm text-gray-500 mt-1">
                Try searching for a username or message
              </p>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 border-t border-gray-800 bg-gray-900/50">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
