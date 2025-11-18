import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Clock, Eye, ArrowLeft, Reply, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AdBanner from '../components/AdBanner';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId, enUS as localeEn } from 'date-fns/locale';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t, translate, language } = useLanguage();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideo();
    fetchComments();
    incrementView();
  }, [id]);

  const fetchVideo = async () => {
    try {
      const response = await axios.get(`${API}/videos/${id}`);
      setVideo(response.data);
    } catch (error) {
      console.error('Failed to fetch video:', error);
      toast.error('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API}/comments/${id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const incrementView = async () => {
    try {
      await axios.post(`${API}/videos/${id}/view`);
    } catch (error) {
      console.error('Failed to increment view:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error(t({ id: 'Login untuk menyukai video', en: 'Login to like videos' }));
      return;
    }
    try {
      const isLiked = user.liked_videos?.includes(id);
      if (isLiked) {
        await axios.delete(`${API}/videos/${id}/like`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/videos/${id}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update like status');
    }
  };

  const handleWatchLater = async () => {
    if (!user) {
      toast.error(t({ id: 'Login untuk menambah ke tonton nanti', en: 'Login to add to watch later' }));
      return;
    }
    try {
      const isInWatchLater = user.watch_later?.includes(id);
      if (isInWatchLater) {
        await axios.delete(`${API}/user/watch-later/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/user/watch-later/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      window.location.reload();
    } catch (error) {
      toast.error('Failed to update watch later');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error(t({ id: 'Login untuk berkomentar', en: 'Login to comment' }));
      return;
    }
    if (!newComment.trim()) return;

    try {
      await axios.post(
        `${API}/comments`,
        { 
          video_id: id, 
          comment: newComment,
          parent_comment_id: replyTo?.id || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      setReplyTo(null);
      fetchComments();
      toast.success(t({ id: 'Komentar ditambahkan', en: 'Comment added' }));
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
      toast.success(t({ id: 'Komentar dihapus', en: 'Comment deleted' }));
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="aspect-video bg-gray-700 rounded-lg" />
        <div className="h-8 bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-700 rounded w-1/2" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t({ id: 'Video tidak ditemukan', en: 'Video not found' })}</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t(translate.backToHome)}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 fade-in" data-testid="video-player-page">
      <div className="aspect-video rounded-lg overflow-hidden bg-black" data-testid="video-player">
        <iframe
          src={video.embed_url}
          className="w-full h-full"
          allowFullScreen
          title={t(video.title)}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="video-title">
            {t(video.title)}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1" data-testid="video-views">
              <Eye className="w-4 h-4" />
              {video.views} {t(translate.views)}
            </span>
            <span data-testid="video-category">{t(video.category)}</span>
            {video.episode && <span data-testid="video-episode">{t(translate.episode)} {video.episode}</span>}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={user?.liked_videos?.includes(id) ? 'default' : 'outline'}
            onClick={handleLike}
            data-testid="like-btn"
          >
            <Heart className={`w-4 h-4 mr-2 ${user?.liked_videos?.includes(id) ? 'fill-current' : ''}`} />
            {t({ id: 'Suka', en: 'Like' })}
          </Button>
          <Button
            variant={user?.watch_later?.includes(id) ? 'default' : 'outline'}
            onClick={handleWatchLater}
            data-testid="watch-later-btn"
          >
            <Clock className="w-4 h-4 mr-2" />
            {t(translate.watchLater)}
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2">{t(translate.description)}</h2>
            <p className="text-sm whitespace-pre-wrap" data-testid="video-description">
              {t(video.description)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="font-semibold text-lg">{t(translate.comments)}</h2>

            {user && (
              <form onSubmit={handleAddComment} className="space-y-2" data-testid="comment-form">
                {replyTo && (
                  <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded">
                    <span className="text-sm">
                      {t({ id: 'Membalas', en: 'Replying to' })} <strong>@{replyTo.username}</strong>
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyTo(null)}
                      data-testid="cancel-reply-btn"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <Textarea
                  placeholder={replyTo ? t({ id: 'Tulis balasan...', en: 'Write a reply...' }) : t(translate.addComment)}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  data-testid="comment-input"
                />
                <Button type="submit" data-testid="comment-submit-btn">
                  {t({ id: 'Kirim', en: 'Submit' })}
                </Button>
              </form>
            )}

            <div className="space-y-4" data-testid="comments-list">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4" data-testid="no-comments-message">
                  {t(translate.noComments)}
                </p>
              ) : (
                comments.filter(c => !c.parent_comment_id).map((comment) => (
                  <div key={comment.id} data-testid={`comment-${comment.id}`}>
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={comment.avatar} />
                        <AvatarFallback>{comment.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-sm">{comment.username}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {format(new Date(comment.created_at), 'PPp', {
                                locale: language === 'id' ? localeId : localeEn
                              })}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {user && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setReplyTo(comment)}
                                data-testid={`reply-comment-${comment.id}`}
                              >
                                <Reply className="w-4 h-4" />
                              </Button>
                            )}
                            {user?.username === comment.user_id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteComment(comment.id)}
                                data-testid={`delete-comment-${comment.id}`}
                              >
                                {t(translate.delete)}
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm mt-1">{comment.comment}</p>
                      </div>
                    </div>
                    
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-14 mt-3 space-y-3" data-testid={`replies-${comment.id}`}>
                        {comments.filter(c => c.parent_comment_id === comment.id).map((reply) => (
                          <div key={reply.id} className="flex gap-3" data-testid={`reply-${reply.id}`}>
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={reply.avatar} />
                              <AvatarFallback>{reply.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-semibold text-sm">{reply.username}</span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {format(new Date(reply.created_at), 'PPp', {
                                      locale: language === 'id' ? localeId : localeEn
                                    })}
                                  </span>
                                </div>
                                {user?.username === reply.user_id && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteComment(reply.id)}
                                    data-testid={`delete-reply-${reply.id}`}
                                  >
                                    {t(translate.delete)}
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm mt-1">{reply.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoPlayer;
