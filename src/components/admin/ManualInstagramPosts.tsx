import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ManualInstagramPost {
  id: string;
  url: string;
  title?: string;
  description?: string;
  isActive: boolean;
  addedAt: string;
  embedCode?: string;
}

interface ManualInstagramPostsProps {
  onPostsChange?: (posts: ManualInstagramPost[]) => void;
}

const ManualInstagramPosts: React.FC<ManualInstagramPostsProps> = ({ onPostsChange }) => {
  const [posts, setPosts] = useState<ManualInstagramPost[]>([]);
  const [newPostUrl, setNewPostUrl] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDescription, setNewPostDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load posts from localStorage on component mount
  useEffect(() => {
    const savedPosts = localStorage.getItem('manualInstagramPosts');
    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts);
        setPosts(parsedPosts);
        onPostsChange?.(parsedPosts);
      } catch (error) {
        console.error('Failed to parse saved Instagram posts:', error);
      }
    }
  }, [onPostsChange]);

  // Save posts to localStorage whenever posts change
  const savePosts = (updatedPosts: ManualInstagramPost[]) => {
    try {
      localStorage.setItem('manualInstagramPosts', JSON.stringify(updatedPosts));
      onPostsChange?.(updatedPosts);
    } catch (error) {
      console.error('Failed to save Instagram posts:', error);
      toast.error('Failed to save posts');
    }
  };

  // Validate Instagram URL
  const isValidInstagramUrl = (url: string): boolean => {
    const instagramUrlPattern = /^https:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?$/;
    return instagramUrlPattern.test(url);
  };

  // Extract post ID from Instagram URL
  const extractPostId = (url: string): string => {
    const match = url.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/);
    return match ? match[2] : '';
  };

  // Generate embed code for Instagram post
  const generateEmbedCode = (url: string): string => {
    const postId = extractPostId(url);
    return `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14"></blockquote>`;
  };

  // Add new post
  const handleAddPost = async () => {
    if (!newPostUrl.trim()) {
      toast.error('Please enter an Instagram post URL');
      return;
    }

    if (!isValidInstagramUrl(newPostUrl)) {
      toast.error('Please enter a valid Instagram post URL (e.g., https://www.instagram.com/p/ABC123/)');
      return;
    }

    // Check if post already exists
    const postId = extractPostId(newPostUrl);
    const existingPost = posts.find(post => extractPostId(post.url) === postId);
    if (existingPost) {
      toast.error('This Instagram post has already been added');
      return;
    }

    setIsLoading(true);

    try {
      const newPost: ManualInstagramPost = {
        id: `manual_${Date.now()}_${postId}`,
        url: newPostUrl.trim(),
        title: newPostTitle.trim() || undefined,
        description: newPostDescription.trim() || undefined,
        isActive: true,
        addedAt: new Date().toISOString(),
        embedCode: generateEmbedCode(newPostUrl.trim())
      };

      const updatedPosts = [...posts, newPost];
      setPosts(updatedPosts);
      savePosts(updatedPosts);

      // Reset form
      setNewPostUrl('');
      setNewPostTitle('');
      setNewPostDescription('');

      toast.success('Instagram post added successfully');
    } catch (error) {
      console.error('Failed to add Instagram post:', error);
      toast.error('Failed to add Instagram post');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle post active status
  const togglePostStatus = (postId: string) => {
    const updatedPosts = posts.map(post => 
      post.id === postId ? { ...post, isActive: !post.isActive } : post
    );
    setPosts(updatedPosts);
    savePosts(updatedPosts);
    toast.success('Post status updated');
  };

  // Remove post
  const removePost = (postId: string) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    setPosts(updatedPosts);
    savePosts(updatedPosts);
    toast.success('Post removed');
  };

  // Save all changes
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      savePosts(posts);
      toast.success('All changes saved successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manual Instagram Posts</h2>
          <p className="text-gray-600 mt-1">
            Add specific Instagram posts for manual embedding. Perfect for showcasing key content.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {/* Add New Post Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Instagram Post</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="post-url" className="block text-sm font-medium text-gray-700 mb-2">
              Instagram Post URL *
            </label>
            <input
              id="post-url"
              type="url"
              value={newPostUrl}
              onChange={(e) => setNewPostUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/ABC123/"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the full Instagram post URL (supports posts and reels)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-2">
                Title (Optional)
              </label>
              <input
                id="post-title"
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Post title or caption"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="post-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                id="post-description"
                type="text"
                value={newPostDescription}
                onChange={(e) => setNewPostDescription(e.target.value)}
                placeholder="Brief description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleAddPost}
            disabled={isLoading || !newPostUrl.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
            {isLoading ? 'Adding...' : 'Add Post'}
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Saved Posts ({posts.length})
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Manage your manually added Instagram posts
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No posts added yet</h4>
            <p className="text-gray-600">
              Add your first Instagram post using the form above
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        post.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <h4 className="font-medium text-gray-900">
                        {post.title || 'Untitled Post'}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {post.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {post.description && (
                      <p className="text-gray-600 text-sm mb-2">{post.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View on Instagram
                      </a>
                      <span>Added {new Date(post.addedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => togglePostStatus(post.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        post.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={post.isActive ? 'Deactivate post' : 'Activate post'}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => removePost(post.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove post"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Third-party Widget Integration Info */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Third-party Widget Integration</h3>
        <p className="text-blue-800 mb-4">
          For automated Instagram feeds, consider using these compliant third-party services:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Juicer</h4>
            <p className="text-gray-600 text-sm mb-3">
              Social media aggregator with Instagram API integration and GDPR compliance.
            </p>
            <a
              href="https://www.juicer.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Learn more →
            </a>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">EmbedSocial</h4>
            <p className="text-gray-600 text-sm mb-3">
              Instagram widget with official API, GDPR compliance, and automatic syncing.
            </p>
            <a
              href="https://embedsocial.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Learn more →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualInstagramPosts;