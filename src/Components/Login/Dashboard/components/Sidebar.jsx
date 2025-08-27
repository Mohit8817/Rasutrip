// components/Sidebar.js - Updated with clean design and proper user/agent logic
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../Context/AuthContext';
import { User, Calendar, CreditCard, Building, LogOut } from 'lucide-react';

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

  // If no user is logged in, show login prompt with clean design
  if (!user) {
    return (
      <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-center items-center px-8">
        <div className="text-center text-gray-600">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-bold mb-6">
            ?
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-6">Please Login</h3>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Base menu items for all users
  const baseMenuItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'bookings', label: 'Booking', icon: Calendar },
    { id: 'payment-history', label: 'Payment History', icon: CreditCard },
  ];

  // Agent-specific menu items
  const agentMenuItems = [
    { id: 'bank-details', label: 'Bank Details', icon: Building },
  ];

  // Combine menu items based on user type
  const menuItems = isAgent()
    ? [...baseMenuItems, ...agentMenuItems]
    : baseMenuItems;

  return (
    <div className=" bg-white border-r border-gray-200 flex flex-col">
      {/* User Profile Section */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 bg-red-500">
            {getUserInitials()}
          </div>

          {/* Enhanced Name Display */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {getUserDisplayName()}
          </h3>

          {/* User Type Badge */}
          {isAgent() && (
            <div className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full mb-2">
              Agent
            </div>
          )}

          {/* Additional User Info */}
          <div className="text-sm text-gray-600">
            {formatMobile(user?.mobile)}
          </div>

          {user?.email && (
            <div className="text-sm text-gray-600 mt-1 truncate">
              {user.email}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${activeTab === item.id
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <IconComponent className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && (
                <span className="ml-auto text-white text-lg">•</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section with Logout */}
      <div className="border-t border-gray-200">
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;