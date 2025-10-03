/**
 * Stories Component
 * Display and create stories (24h disappearing content)
 */

import React, { useState } from 'react';
import { Plus, X, Eye, Heart, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent } from '../ui/dialog';
import { useStories } from '@/hooks';
import type { Stories } from '@/types/appwrite.d';

interface StoriesProps {
  userId: string;
  profileId: string;
}

export function Stories({ userId, profileId }: StoriesProps) {
  const { stories, isLoading, createStory, viewStory } = useStories(userId);
  const [selectedStory, setSelectedStory] = useState<Stories | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleStoryClick = async (story: Stories) => {
    setSelectedStory(story);
    await viewStory(story.$id, profileId);
  };

  const handleCreateStory = async () => {
    // TODO: Implement story creation with media upload
    setShowCreateDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse" />
            <div className="w-12 h-3 bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide">
        {/* Create Story Button */}
        <button
          onClick={handleCreateStory}
          className="flex flex-col items-center gap-2 flex-shrink-0"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Plus className="w-8 h-8 text-white" />
            </div>
          </div>
          <span className="text-xs text-gray-400">Your Story</span>
        </button>

        {/* Story Circles */}
        {stories.map((story) => (
          <button
            key={story.$id}
            onClick={() => handleStoryClick(story)}
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-0.5">
                <div className="w-full h-full rounded-full bg-black p-0.5">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={story.thumbnailUrl || undefined} />
                    <AvatarFallback className="bg-gray-700">
                      {story.userId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              {story.viewCount && story.viewCount > 0 && (
                <Badge className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-xs px-1">
                  {story.viewCount}
                </Badge>
              )}
            </div>
            <span className="text-xs text-gray-400 max-w-[60px] truncate">
              {story.userId}
            </span>
          </button>
        ))}
      </div>

      {/* Story Viewer Dialog */}
      {selectedStory && (
        <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
          <DialogContent className="max-w-md h-[80vh] p-0 bg-black">
            <div className="relative h-full flex items-center justify-center">
              {/* Story Content */}
              {selectedStory.contentType === 'image' && selectedStory.mediaUrl && (
                <img
                  src={selectedStory.mediaUrl}
                  alt="Story"
                  className="max-h-full max-w-full object-contain"
                />
              )}
              {selectedStory.contentType === 'video' && selectedStory.mediaUrl && (
                <video
                  src={selectedStory.mediaUrl}
                  className="max-h-full max-w-full object-contain"
                  autoPlay
                  loop
                />
              )}
              {selectedStory.contentType === 'text' && (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <p className="text-white text-2xl text-center">
                    {selectedStory.textContent}
                  </p>
                </div>
              )}

              {/* Story Header */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {selectedStory.userId.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {selectedStory.userId}
                      </p>
                      <p className="text-gray-300 text-xs">
                        {new Date(selectedStory.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedStory(null)}
                    className="text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full w-full animate-progress" />
                </div>
              </div>

              {/* Story Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="text-white gap-2">
                    <Eye className="w-4 h-4" />
                    {selectedStory.viewCount || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white gap-2">
                    <Heart className="w-4 h-4" />
                    {selectedStory.reactionCount || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white gap-2">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Navigation */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white"
                onClick={() => {
                  const currentIndex = stories.findIndex(s => s.$id === selectedStory.$id);
                  if (currentIndex > 0) {
                    setSelectedStory(stories[currentIndex - 1]);
                  }
                }}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white"
                onClick={() => {
                  const currentIndex = stories.findIndex(s => s.$id === selectedStory.$id);
                  if (currentIndex < stories.length - 1) {
                    setSelectedStory(stories[currentIndex + 1]);
                  }
                }}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
