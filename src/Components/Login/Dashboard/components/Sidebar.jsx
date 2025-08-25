// components/Sidebar.js - Updated with Bank Details for Agents
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../Context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const {
    user,
    userType,
    logout,
    getUserDisplayName,
    getUserFirstName,
    getUserFullName,
    getUserInitials,
    getTimeBasedGreeting
  } = useContext(AuthContext);
  const navigate = useNavigate();

  const formatMobile = (mobile) => {
    if (!mobile) return '';
    // Remove country code and format
    const cleaned = mobile.replace(/^\+?91/, '').replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `+91 ${cleaned.slice(-10, -5)} ${cleaned.slice(-5)}`;
    }
    return mobile;
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home page
  };

  // Determine if user is an agent
  const isAgent = () => {
    if (!user) return false;
    return user.role === 'agent' || user.userType === 'agent' || user.type === 'agent' || userType === 'agent';
  };

  // If no user is logged in, show login prompt with modern design
  if (!user) {
    return (
      <div className="h-screen w-64 bg-gradient-to-b from-grey-400 via-grey-500 to-grey-600 flex flex-col justify-center items-center px-8">
        <div className="text-center text-grey">
          <div className="w-20 h-20 mx-auto rounded-full bg-grey-600 bg-opacity-50 flex items-center justify-center text-grey-100 text-2xl font-bold mb-6">
            ?
          </div>
          <h3 className="text-lg font-medium text-grey-50 mb-6">Please Login</h3>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-grey-600 hover:bg-grey-700 text-grey py-3 px-6 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Base menu items for all users
  const baseMenuItems = [
    { id: 'profile', label: 'Profile' },
    { id: 'bookings', label: 'Booking' },
    { id: 'payment-history', label: 'Payment History' },
  ];

  // Agent-specific menu items
  const agentMenuItems = [
    { id: 'bank-details', label: 'Bank Details' },
  ];

  // Combine menu items based on user type
  const menuItems = isAgent()
    ? [...baseMenuItems, ...agentMenuItems]
    : baseMenuItems;

  return (
    <div className="card shadow h-screen w-64 bg-gradient-to-b from-grey-400 via-grey-500 to-grey-600 text-grey flex flex-col">
      {/* User Profile Section */}
      <div className="px-2 py-2 border-b border-grey-600 border-opacity-30">
        <div className="text-center">
          <div
            className="profile-avatar w-20 h-20 mx-auto rounded-full flex items-center justify-center text-grey text-2xl font-bold mb-4 shadow-lg"
            style={{
              background: isAgent()
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            }}
          >
            {getUserInitials()}
          </div>

          {/* Enhanced Name Display */}
          <h3 className="text-xl font-semibold text-grey mb-2">
            {getUserDisplayName()}
          </h3>

          {/* User Type Badge */}
          {isAgent() && (
            <div className="inline-block px-3 py-1 bg-blue-600 bg-opacity-20 text-blue-200 text-xs font-medium rounded-full mb-2">
              Agent
            </div>
          )}

          {/* Additional User Info */}
          <div className="text-sm text-grey-100 opacity-90">
            {formatMobile(user?.mobile)}
          </div>

          {user?.email && (
            <div className="text-sm text-grey-100 opacity-90 mt-1 truncate">
              {user.email}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-6 py-8 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-6 py-4 text-left rounded-lg transition-all duration-200 font-medium text-lg ${activeTab === item.id
              ? 'bg-grey-600 bg-opacity-40 text-grey shadow-lg transform scale-105'
              : 'text-grey-50 hover:bg-grey-600 hover:bg-opacity-30 hover:text-grey hover:transform hover:scale-102'
              }`}
          >
            <span className="flex items-center">
              {/* Add icons for better visual distinction */}
              {item.id === 'profile'}
              {item.id === 'bookings'}
              {item.id === 'payment-history'}
              {item.id === 'bank-details'}
              {item.label}
            </span>
            {activeTab === item.id && (
              <span className="ml-auto text-grey-100 text-2xl">•</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Section with Footer Info and Logout */}
      <div className="border-t border-purple-700">
        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left rounded-lg text-purple-200 hover:bg-grey-600 hover:bg-opacity-20 hover:text-grey-300 transition-all duration-200 hover:transform hover:scale-102"
          >
            <span className="font-medium text-dark">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;