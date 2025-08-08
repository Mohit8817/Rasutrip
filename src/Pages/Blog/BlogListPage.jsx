import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BlogListPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const BASE_URL = 'https://api.rasutrip.com/api/v1';

  // Fetch all blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/user/blog`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle your specific API response structure
      const blogs = data.blogs || [];
      setBlogPosts(Array.isArray(blogs) ? blogs : []);
      setError(null);
      
      console.log('Blogs fetched:', blogs.length);
    } catch (err) {
      setError(`Failed to fetch blogs: ${err.message}`);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle blog card click - navigate to blog detail page
  const handleBlogClick = (blogId) => {
    navigate(`/blog/${blogId}`);
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Date not available';
    }
  };

  // Get reading time estimate
  const getReadingTime = (content) => {
    if (!content) return '5 min read';
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  // Get excerpt from content (strip HTML tags)
  const getExcerpt = (htmlContent, maxLength = 150) => {
    if (!htmlContent) return 'No excerpt available';
    
    // Strip HTML tags
    const textContent = htmlContent.replace(/<[^>]*>/g, '');
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...'
      : textContent;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading blogs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-red-800 mb-4">Error Loading Blogs</h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button 
                onClick={fetchBlogs}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!blogPosts.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Blogs Found</h2>
              <p className="text-gray-600 mb-6">There are no blog posts available at the moment.</p>
              <button 
                onClick={fetchBlogs}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Our Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest travel tips, destination guides, and booking insights
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Found {blogPosts.length} blog{blogPosts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <article
              key={post._id || post.id || index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-2"
              onClick={() => handleBlogClick(post._id || post.id)}
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={post.featuredImage?.url || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop'}
                  alt={post.title || 'Blog post'}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop';
                  }}
                />
                {post.categories && post.categories.length > 0 && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {post.categories[0]}
                    </span>
                  </div>
                )}
                {post.status && (
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Keywords as additional tags if no tags */}
                {(!post.tags || post.tags.length === 0) && post.keywords && post.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.keywords.slice(0, 3).map((keyword, keywordIndex) => (
                      <span
                        key={keywordIndex}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg capitalize"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title || 'Untitled Blog Post'}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {getExcerpt(post.content || post.metaDescription)}
                </p>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="mr-2">👤</span>
                      <span>{post.author?.name || post.author === "67f3a54abb43170178d6094d" ? "Admin" : (typeof post.author === 'string' ? post.author : 'Anonymous')}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">⏱️</span>
                      <span>{getReadingTime(post.content)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">📅</span>
                    <span>{formatDate(post.uploadDate || post.createdAt)}</span>
                  </div>

                  {/* Read More Button */}
                  <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors group">
                    Read More
                    <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button 
            onClick={fetchBlogs}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Refresh Posts
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogListPage;