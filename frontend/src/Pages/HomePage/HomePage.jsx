import CreatePost from "../../Components/CreatePost/CreatePost";
import Post from "../../Components/Post/Post";
import { useEffect, useRef } from "react";
import { usePostStore } from "../../store/usePostStore";
import { useSearchParams } from "react-router-dom";

export default function HomePage() {
  const { posts, isLoadingPosts, getAllPosts } = usePostStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const postRefs = useRef({});
  const highlightedPostId = searchParams.get("post");

  useEffect(() => {
    getAllPosts();
  }, []);

  // Scroll to highlighted post when posts are loaded
  useEffect(() => {
    if (
      highlightedPostId &&
      posts.length > 0 &&
      postRefs.current[highlightedPostId]
    ) {
      setTimeout(() => {
        postRefs.current[highlightedPostId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        // Clear the query parameter after scrolling
        setTimeout(() => {
          setSearchParams({});
        }, 2000);
      }, 100);
    }
  }, [highlightedPostId, posts]);

  return (
    <div className="w-full">
      <CreatePost />
      {isLoadingPosts ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-400">Loading posts...</p>
        </div>
      ) : posts && posts.length > 0 ? (
        posts.map((post) => (
          <div
            key={post._id}
            ref={(el) => (postRefs.current[post._id] = el)}
            className={`transition-all duration-500 ${
              highlightedPostId === post._id
                ? "ring-2 ring-cyan-500 rounded-lg"
                : ""
            }`}
          >
            <Post post={post} />
          </div>
        ))
      ) : (
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-400">
            No posts yet. Create one to get started!
          </p>
        </div>
      )}
    </div>
  );
}
