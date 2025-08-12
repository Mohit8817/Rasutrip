// src/components/BookingTabs.jsx
import React from 'react';
import { FaPlane, FaHotel, FaBus } from 'react-icons/fa';

const BookingTabs = ({ activeBookingTab, setActiveBookingTab }) => {
    const tabs = [
        { name: 'Flight', icon: <FaPlane size={24} /> },
        { name: 'Hotel', icon: <FaHotel size={24} /> },
        { name: 'Bus', icon: <FaBus size={24} /> },
    ];

    return (
        <div className="flex justify-center space-x-4 p-6 bg-white rounded-lg shadow-md">
            {tabs.map((tab) => (
                <div
                    key={tab.name}
                    onClick={() => setActiveBookingTab(tab.name)}
                    className={`flex flex-col items-center px-5 py-1 rounded-lg cursor-pointer transition-all duration-300 min-w-[100px]
                        ${activeBookingTab === tab.name 
                            ? 'bg-red-600 text-white shadow-lg transform scale-105' 
                            : 'bg-white text-gray-800 hover:shadow-lg hover:bg-gray-50 border border-gray-200'}
                    `}
                >
                    <div className={`mb-2 ${activeBookingTab === tab.name ? 'text-white' : 'text-red-600'}`}>
                        {tab.icon}
                    </div>
                    <span className="text-base font-medium">{tab.name}</span>
                </div>
            ))}
        </div>
    );
};

export default BookingTabs;