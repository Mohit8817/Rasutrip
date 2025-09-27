import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

const reviews = [
  {
    name: "Amit Sharma",
    role: "6 reviews",
    rating: 5,
    content:
      "I booked a flight and hotel through RasuTrip and the experience was seamless! Everything was well-coordinated and support was top-notch.",
  },
  {
    name: "Neha Verma",
    role: "3 reviews 1 photo",
    rating: 5,
    content:
      "Highly recommend RasuTrip for last-minute bus bookings. Their platform is fast and easy to use. Customer support is very responsive.",
  },
  {
    name: "Rahul Mehta",
    role: "2 reviews",
    rating: 5,
    content:
      "Booked a hotel in Goa through RasuTrip — got the best price and smooth check-in. Loved the service!",
  },
  {
    name: "Priya Nair",
    role: "4 reviews",
    rating: 4,
    content:
      "Their flight booking system is super quick. Got amazing deals. Just wish they had more filter options, otherwise perfect!",
  },
  {
    name: "Rohit Sinha",
    role: "5 reviews 2 photos",
    rating: 5,
    content:
      "One of the best travel platforms I've used. Buses, flights, and hotels — all in one place. Keep it up RasuTrip!",
  },
];

const GoogleReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("");
  };

  return (
    <section className="bg-black text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          WHAT PEOPLE SAY ABOUT US?
        </h2>

        <div className="flex flex-col justify-center items-center gap-3 mb-10">
          <FcGoogle className="w-[180px] aspect-square" />
          <span className="text-lg md:text-xl font-semibold">
            Verified Customer Reviews
          </span>
          <div className="text-yellow-400 flex">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-xl">
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="relative w-[70vw] mx-auto h-auto">
          <div className="bg-white text-black p-6 rounded-lg shadow-lg min-h-[13rem]">
            <div className="flex items-center gap-4 mb-4 justify-center">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-black">
                {getInitials(reviews[currentIndex].name)}
              </div>
              <div>
                <h4 className="font-semibold text-lg">
                  {reviews[currentIndex].name}
                </h4>
                <div className="flex text-yellow-400">
                  {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                    <span key={i} className="text-sm">
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-center leading-6">
              {reviews[currentIndex].content}
            </p>
          </div>

          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-yellow-400 text-black rounded-full p-2 focus:outline-none"
          >
            ❮
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-yellow-400 text-black rounded-full p-2 focus:outline-none"
          >
            ❯
          </button>

          <div className="flex justify-center mt-6">
            {reviews.map((_, index) => (
              <span
                key={index}
                className={`h-2 w-2 rounded-full mx-1 ${
                  index === currentIndex ? "bg-yellow-400" : "bg-gray-500"
                }`}
              ></span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
