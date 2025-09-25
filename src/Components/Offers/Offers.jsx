import React, { useEffect, useState } from "react";

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading offers...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Special Offers</h2>

      {offers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          No offers available. Please login to see offers.
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {offers.map((offer) => (
            <div
              key={offer._id}
              className="rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden bg-white border"
            >
              {/* Image / Gradient Background */}
              <div
                className="h-40 bg-cover bg-center"
                style={{
                  backgroundImage: offer.image
                    ? `url(${offer.image})`
                    : "linear-gradient(to bottom right, #60a5fa, #a78bfa, #f472b6)",
                }}
              ></div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {offer.type === "FLAT"
                    ? `Flat ₹${offer.value} Off`
                    : `Up to ${offer.value}% Off`}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {offer.description}
                </p>

                <div className="text-sm font-semibold text-gray-800 mb-1">
                  {offer.name}
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Valid: {formatDate(offer.startDate)} –{" "}
                  {formatDate(offer.endDate)}
                </div>

                {/* Offer Code */}
                <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-3 py-2 rounded-lg font-semibold w-fit">
                  Code: {offer.code}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
