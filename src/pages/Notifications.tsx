
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CustomNavbar from "@/components/CustomNavbar";
import { useAuth } from "@/contexts/auth";
import { useNotifications } from "@/contexts/notification";
import { toast } from "sonner";
import type { Notification } from "@/services/notificationService";

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification.id);
      }
      
      if (notification.type === "follow") {
        navigate(`/profile/${notification.actorId}`);
      } else if (notification.postId) {
        navigate(`/post/${notification.postId}`);
      }
    } catch (error) {
      console.error("Error handling notification:", error);
      toast.error("Something went wrong");
    }
  };

  const renderNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case "like":
        return (
          <span>
            <strong>{notification.actor?.name}</strong> liked your post
          </span>
        );
      case "comment":
        return (
          <span>
            <strong>{notification.actor?.name}</strong> commented on your post
          </span>
        );
      case "follow":
        return (
          <span>
            <strong>{notification.actor?.name}</strong> started following you
          </span>
        );
      case "mention":
        return (
          <span>
            <strong>{notification.actor?.name}</strong> mentioned you in a post
          </span>
        );
      default:
        return (
          <span>
            <strong>{notification.actor?.name}</strong> interacted with your content
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <CustomNavbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Notifications</h1>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-sm"
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-gray-500">Loading notifications...</div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`guys-card p-4 cursor-pointer transition-colors ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={notification.actor?.profilePicture || undefined}
                      alt={notification.actor?.username}
                    />
                    <AvatarFallback>
                      {notification.actor?.username?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-800">
                        {renderNotificationContent(notification)}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications yet</h3>
            <p className="text-gray-500">When you get notifications, they'll show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
