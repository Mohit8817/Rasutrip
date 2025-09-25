import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const OffersCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("FLIGHT");
  const [showAll, setShowAll] = useState(false);

  const categories = [
    { name: "Flights", value: "FLIGHT" },
    { name: "Hotels", value: "HOTEL" },
    { name: "Bus", value: "BUS" },
    // { name: "Bank Offers", value: "BANK" },
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

  const nextSlide = () => {
    if (currentIndex + 4 < filteredOffers.length)
      setCurrentIndex(currentIndex + 1);
  };

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const visibleOffers = filteredOffers.slice(currentIndex, currentIndex + 4);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });

  const handleCategoryClick = (categoryValue) => {
    setActiveCategory(categoryValue);
    setCurrentIndex(0);
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
    <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Offers For You</h2>
      </div>
      <div className="flex gap-3 items-center justify-start mb-4 sm:justify-end">
        {categories.map((cat, index) => (
          <button
            key={index}
            onClick={() => handleCategoryClick(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              activeCategory === cat.value
                ? "bg-blue-500 text-white border-blue-500 "
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat.name}
          </button>
        ))}
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-orange-500 font-medium text-sm hover:text-orange-600 flex items-center"
        >
          {showAll ? "Show Less" : "View All"} <span className="ml-1">→</span>
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No offers available. Please login to see offers.
        </div>
      ) : (
        <div className="relative">
          {/* Navigation Buttons */}
          {!showAll && filteredOffers.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full shadow-lg flex items-center justify-center ${
                  currentIndex === 0
                    ? "bg-gray-200 text-gray-400 "
                    : "bg-white text-gray-600 hover:shadow-xl"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentIndex + 4 >= filteredOffers.length}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full shadow-lg flex items-center justify-center ${
                  currentIndex + 4 >= filteredOffers.length
                    ? "bg-gray-200 text-gray-400 "
                    : "bg-white text-gray-600 hover:shadow-xl"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Offers Cards */}
          <div className="flex gap-4 overflow-hidden px-4">
            {visibleOffers.map((offer) => (
              <div
                key={offer._id}
                className="flex-1 min-w-72 max-w-80 rounded-2xl p-6 text-black relative cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 bg-cover bg-center"
                style={{
                  backgroundImage: offer.image
                    ? `url(${offer.image})`
                    : "linear-gradient(to br, #a78bfa, #f472b6, #f87171)",
                }}
              >
                <h3 className="text-xl font-bold mb-1">
                  {offer.type === "FLAT"
                    ? `Up to ₹${offer.value} Off`
                    : `Up to ${offer.value}% Off`}
                </h3>
                <p className="text-sm opacity-95 leading-relaxed mb-2">
                  {offer.description}
                </p>
                <div className="text-sm font-semibold mb-1">{offer.name}</div>
                <div className="text-xs opacity-90 mb-8">
                  Valid: {formatDate(offer.startDate)} -{" "}
                  {formatDate(offer.endDate)}
                </div>
                <div className="absolute bottom-4 left-6 text-xs bg-white/20 text-black px-2 py-1 rounded backdrop-blur-sm">
                  Code: {offer.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersCarousel;
