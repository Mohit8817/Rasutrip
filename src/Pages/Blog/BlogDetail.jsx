import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BlogDetail = () => {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const BASE_URL = 'https://api.rasutrip.com/api/v1';

    // Fetch blog by ID
    const fetchBlogById = async (blogId) => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/user/blog-by-id/${blogId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const blogData = data.data || data.blog || data;
            setBlog(blogData);
            setError(null);
        } catch (err) {
            console.error('Error fetching blog details:', err);
            setError(`Failed to fetch blog details: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchBlogById(id);
        }
    }, [id]);

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

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center min-h-96">
                        <div className="text-center">
                            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-xl text-gray-600">Loading blog...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                            <h2 className="text-2xl font-bold text-red-800 mb-4">Error Loading Blog</h2>
                            <p className="text-red-600 mb-6">{error}</p>
                            <div className="space-x-4">
                                <button
                                    onClick={() => fetchBlogById(id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => navigate('/blogs')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
                                >
                                    Back to Blogs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Blog not found state
    if (!blog) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog Not Found</h2>
                            <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
                            <button
                                onClick={() => navigate('/blogs')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                Back to Blogs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Blog Header */}
                <header className="mb-8">
                    {/* Categories */}
                    {blog.categories && blog.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {blog.categories.map((category, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium capitalize"
                                >
                                    {category}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        {blog.title || 'Untitled Blog Post'}
                    </h1>

                    {/* Meta Description */}
                    {blog.metaDescription && (
                        <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                            {blog.metaDescription}
                        </p>
                    )}

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-8">
                        <div className="flex items-center">
                            <span className="mr-2">👤</span>
                            <span>{blog.author?.name || blog.author === "67f3a54abb43170178d6094d" ? "Admin" : (typeof blog.author === 'string' ? blog.author : 'Anonymous')}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2">📅</span>
                            <span>{formatDate(blog.uploadDate || blog.createdAt)}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2">⏱️</span>
                            <span>{getReadingTime(blog.content)}</span>
                        </div>
                        {blog.status && (
                            <div className="flex items-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${blog.status === 'published'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {blog.status}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Featured Image */}
                    {blog.featuredImage?.url && (
                        <div className="mb-8">
                            <img
                                src={blog.featuredImage.url}
                                alt={blog.title || 'Blog featured image'}
                                className="w-full h-96 object-cover rounded-2xl shadow-lg"
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop';
                                }}
                            />
                        </div>
                    )}
                </header>

                {/* Blog Content */}
                <article className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <div
                        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
                        dangerouslySetInnerHTML={{
                            __html: blog.content || '<p>No content available for this blog post.</p>'
                        }}
                    />
                </article>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {blog.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm capitalize hover:bg-gray-200 transition-colors"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Keywords */}
                {blog.keywords && blog.keywords.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                            {blog.keywords.map((keyword, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm capitalize"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Blog Meta */}
                {(blog.slug || blog.metaKeywords) && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Information</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            {blog.slug && (
                                <div>
                                    <span className="font-medium">Slug:</span> {blog.slug}
                                </div>
                            )}
                            {blog.metaKeywords && (
                                <div>
                                    <span className="font-medium">Meta Keywords:</span> {blog.metaKeywords}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogDetail;