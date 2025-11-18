import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Heart, Clock, List } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const VideoCard = ({ video, onLike, onWatchLater, isLiked, isInWatchLater }) => {
  const navigate = useNavigate();
  const { t, translate } = useLanguage();

  return (
    <Card className="video-card overflow-hidden cursor-pointer group" data-testid={`video-card-${video.id}`}>
      <div className="relative aspect-video" onClick={() => navigate(`/video/${video.id}`)}>
        <img
          src={video.thumbnail_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${video.id}`}
          alt={t(video.title)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" />
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-base line-clamp-2" data-testid="video-title">
          {t(video.title)}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1" data-testid="video-views">
              <Eye className="w-4 h-4" />
              {video.views} {t(translate.views)}
            </span>
            <span className="text-xs" data-testid="video-category">{t(video.category)}</span>
          </div>
        </div>
        {video.episode && (
          <div className="text-xs text-gray-500" data-testid="video-episode">
            {t(translate.episode)} {video.episode}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant={isLiked ? 'default' : 'outline'}
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onLike?.();
            }}
            data-testid="video-like-btn"
          >
            <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant={isInWatchLater ? 'default' : 'outline'}
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onWatchLater?.();
            }}
            data-testid="video-watch-later-btn"
          >
            <Clock className="w-4 h-4 mr-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
