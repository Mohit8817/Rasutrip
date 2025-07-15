import React from "react";
import { motion } from "framer-motion";
import {
    FaRegMoneyBillAlt,
    FaClock,
    FaBan,
    FaMapSigns,
    FaGlobeAmericas,
    FaCarAlt,
    FaCity,
} from "react-icons/fa"; // Example icons from react-icons

const Whybook = () => {
    const features = [
        {
            id: 1,
            icon: <FaRegMoneyBillAlt className="w-12 h-12 text-blue-500" />,
            title: "Price Transparency",
            description: "We make all charges upfront. No extra charges or hidden fees.",
        },
        {
            id: 2,
            icon: <FaClock className="w-12 h-12 text-green-500" />,
            title: "24x7",
            description: "Book yourself for the best rates. We’re here to help 24x7.",
        },
        {
            id: 3,
            icon: <FaBan className="w-12 h-12 text-red-500" />,
            title: "Zero Cancellation",
            description: "Enjoy zero cancellation benefit subject to Tajwaycabs terms.",
        },
        {
            id: 4,
            icon: <FaMapSigns className="w-12 h-12 text-yellow-500" />,
            title: "Flexible Tariff Plan",
            description: "Choose a tariff plan that suits your needs, with flexible options.",
        },
        {
            id: 5,
            icon: <FaGlobeAmericas className="w-12 h-12 text-purple-500" />,
            title: "All India Permits",
            description: "We offer vehicles with all India permits, so you can travel anywhere.",
        },
        {
            id: 6,
            icon: <FaCarAlt className="w-12 h-12 text-orange-500" />,
            title: "Several Options",
            description: "Choose from a variety of vehicle options to suit your needs.",
        },
        {
            id: 7,
            icon: <FaCity className="w-12 h-12 text-pink-500" />,
            title: "Multiple Cities",
            description: "Available across multiple cities, making your travel easier.",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <section className="py-12 bg-gray-100">
            <h2 className="text-center text-3xl font-semibold leading-[36px] mb-12 font-montserrat">
                Why Book On TSJ?
            </h2>
            <div className="flex flex-col lg:flex-row w-[80vw] mx-auto gap-8 items-center">
                {/* Left Section */}
                <motion.div
                    className="flex flex-col gap-8 w-full lg:w-[50%]"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.id}
                            className="flex items-start gap-4 text-start"
                            variants={itemVariants}
                        >
                            {/* Icon */}
                            <div className="flex items-center justify-center">
                                {feature.icon}
                            </div>
                            {/* Title & Description */}
                            <div>
                                <h3 className="text-lg font-semibold font-montserrat">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-600 font-montserrat">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Right Section */}
                <div className="w-[50%]">
                    <img
                        src="https://stimg.cardekho.com/images/carexteriorimages/930x620/Tata/Nexon/11104/1697698470038/front-left-side-47.jpg"
                        alt="Car Image"
                        className="rounded-lg shadow-lg"
                    />
                </div>
            </div>
        </section>
    );
};

export default Whybook;
