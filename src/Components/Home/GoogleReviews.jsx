import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

const reviews = [
    {
        name: "Tarun Pawar",
        role: "3 reviews 2 photos",
        rating: 5,
        content:
            "Have good experience. Mr. Ankit Singh was very humble and polite. We got good condition car. We have rented an Ertiga in minimal budget. Overall good experience. Highly recommended for rental cars. Must visit!",
    },
    {
        name: "Nov",
        role: "4 reviews",
        rating: 5,
        content:
            "Very professional team. Pilot Saab Satosh Ji is having a smiling face. Car condition was good.",
    },
    {
        name: "Aayushman Pandey",
        role: "3 reviews",
        rating: 5,
        content:
            "Excellent service and, most importantly, the whole staff is very cooperative. Cars are extremely amazing at nominal rates. Loved it!",
    },
    {
        name: "Hardik Chouksey",
        role: "5 reviews",
        rating: 5,
        content:
            "This company is so good. Excellent services. Vehicle condition is also good. Thank you so much TSJ! 👏👏🥰",
    },
    {
        name: "Mohit Pareek",
        role: "5 reviews 4 photos",
        rating: 4,
        content:
            "Cars are in very good condition and reasonable too. I suggest everyone to prefer TSJ for self-driven cars.",
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

                <div className="relative w-[60vw] mx-auto h-auto">
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
                                    index === currentIndex
                                        ? "bg-yellow-400"
                                        : "bg-gray-500"
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
