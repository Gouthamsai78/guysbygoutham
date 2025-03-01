
import React from "react";
import { Post as PostType } from "@/types";
import Post from "./Post";
import { PenLine } from "lucide-react";

interface PostListProps {
  posts: PostType[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <div className="guys-card py-12 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="bg-guys-gray rounded-full p-4">
            <PenLine className="h-10 w-10 text-guys-primary" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700">No posts yet</h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            Be the first to share your thoughts with the community!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostList;
