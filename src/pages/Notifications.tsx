
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CustomNavbar from "@/components/CustomNavbar";

// Placeholder notification data
const notifications = [
  {
    id: "1",
    type: "like",
    user: {
      id: "user-1",
      name: "John Doe",
      username: "johndoe",
      profilePicture: null,
    },
    postId: "post-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    type: "comment",
    user: {
      id: "user-2",
      name: "Jane Smith",
      username: "janesmith",
      profilePicture: null,
    },
    postId: "post-2",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "3",
    type: "follow",
    user: {
      id: "user-3",
      name: "Alex Johnson",
      username: "alexj",
      profilePicture: null,
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const Notifications: React.FC = () => {
  const navigate = useNavigate();

  const renderNotificationContent = (notification: any) => {
    switch (notification.type) {
      case "like":
        return (
          <span>
            <strong>{notification.user.name}</strong> liked your post
          </span>
        );
      case "comment":
        return (
          <span>
            <strong>{notification.user.name}</strong> commented on your post
          </span>
        );
      case "follow":
        return (
          <span>
            <strong>{notification.user.name}</strong> started following you
          </span>
        );
      default:
        return (
          <span>
            <strong>{notification.user.name}</strong> interacted with your content
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

  const handleNotificationClick = (notification: any) => {
    if (notification.type === "follow") {
      navigate(`/profile/${notification.user.id}`);
    } else if (notification.postId) {
      navigate(`/post/${notification.postId}`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <CustomNavbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
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

        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="guys-card p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage
                    src={notification.user.profilePicture}
                    alt={notification.user.username}
                  />
                  <AvatarFallback>
                    {notification.user.username.substring(0, 2).toUpperCase()}
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
      </div>
    </div>
  );
};

export default Notifications;
