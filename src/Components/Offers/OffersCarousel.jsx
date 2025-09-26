import React, { useState, useEffect } from "react";

const OffersCarousel = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("FLIGHT");
  const [showAll, setShowAll] = useState(false);

  const categories = [
    { name: "Flights", value: "FLIGHT" },
    { name: "Hotels", value: "HOTEL" },
    { name: "Bus", value: "BUS" },
  ];

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setOffers([]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://api.rasutrip.com/api/v1/user/special-offer",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setOffers(data.offers || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const filteredOffers = showAll
    ? offers
    : offers.filter((offer) => offer.applicableFor === activeCategory);

  const handleCategoryClick = (categoryValue) => {
    setActiveCategory(categoryValue);
    setShowAll(false);
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 bg-white flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading offers...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-9xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col mb-3 md:flex-row md:justify-between md:items-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 md:mb-0">
          Offers For You
        </h2>

        <div
          className="flex flex-nowrap gap-3 items-center justify-start md:justify-end overflow-x-auto"
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE 10+
          }}
        >
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(cat.value)}
              className={`px-5 py-2 text-sm font-medium transition-all border rounded-full shrink-0
            ${
              activeCategory === cat.value
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
            >
              {cat.name}
            </button>
          ))}

          {/* View All button */}
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-orange-500 font-medium text-sm hover:text-orange-600 flex items-center shrink-0"
          >
            {showAll ? "Show Less" : "View All"} <span className="ml-1">→</span>
          </button>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No offers available. Please login to see offers.
        </div>
      ) : (
        <div className="relative">
          {/* Horizontally Scrollable Offers */}
          <div
            className="flex gap-4 overflow-x-auto px-3 pb-3 scrollbar-hide"
            style={{
              scrollBehavior: "smooth",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {filteredOffers.map((offer) => (
              <div
                key={offer._id}
                className="flex-1 min-w-80 max-w-96 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer bg-white"
              >
                <img
                  src={offer.image}
                  alt="Offer"
                  className="w-full h-40 object-cover" // Reduced height
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersCarousel;
