import React, { useState, useEffect } from 'react';

const LatestBlog = () => {
  const [blogList, setBlogList] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);

  const dummyData = [
    {
      id: 1,
      title: 'Top 5 Travel Destinations in 2025',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      content: `<p>Discover the most breathtaking places you must visit in 2025, from tropical beaches to mountain escapes.</p>`,
      createdAt: '2025-06-30T09:00:00Z',
    },
    {
      id: 2,
      title: 'How to Pack Light for a 2-Week Trip',
      coverImage: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf',
      content: `<p>Packing smart is a skill. Here are tips on how to travel light while keeping everything you need.</p>`,
      createdAt: '2025-07-01T14:30:00Z',
    },
    {
      id: 3,
      title: 'Best Street Foods Around the World',
      coverImage: 'https://images.unsplash.com/photo-1589308078055-2472a49ff5f3',
      content: `<p>From Bangkok to Mexico City, explore the tastiest and most affordable street foods globally.</p>`,
      createdAt: '2025-07-05T11:00:00Z',
    },
    {
      id: 4,
      title: 'How to Travel Safely in 2025',
      coverImage: 'https://images.unsplash.com/photo-1524777314-971101b9020c',
      content: `<p>Learn the most up-to-date safety travel tips, covering health, digital safety, and solo travel tips.</p>`,
      createdAt: '2025-07-10T08:45:00Z',
    },
  ];

  useEffect(() => {
    setBlogList(dummyData);
  }, []);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleReadMore = (blog) => {
    setSelectedBlog(blog);
  };

  const handleBack = () => {
    setSelectedBlog(null);
  };

  return (
    <div className="w-[90vw] md:container mx-auto md:px-4 py-8">
      {selectedBlog ? (
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <button
            className="text-blue-500 font-medium hover:underline mb-4"
            onClick={handleBack}
          >
            &larr; Back to Blogs
          </button>
          <h2 className="text-3xl font-bold mb-4">{selectedBlog.title}</h2>
          <img
            src={selectedBlog.coverImage}
            alt={selectedBlog.title}
            className="w-full h-64 object-cover mb-4"
          />
          <div
            className="text-left text-gray-700"
            dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
          />
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-center mb-8">LATEST BLOG</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-[90vw] mx-auto md:w-[80vw]">
            {blogList.map((blog) => (
              <div key={blog.id} className="bg-white overflow-hidden shadow-md rounded-md">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <span className="mr-4 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-4 h-4 mr-1"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                      </svg>
                      {formatDate(blog.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-4 h-4 mr-1"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5l16.5 16.5" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 10.5a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      TSJ
                    </span>
                  </div>
                  <h3 className="text-md font-semibold mb-2">{blog.title}</h3>
                  <button
                    onClick={() => handleReadMore(blog)}
                    className="text-blue-500 font-medium hover:underline"
                  >
                    Read more...
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LatestBlog;
