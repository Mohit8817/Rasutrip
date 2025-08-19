// components/Sidebar.js - Updated with Wallet Balance
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

  // If no user is logged in, show login prompt
  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6 sticky top-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-2xl font-bold mb-4">
            ?
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-4">Please Login</h3>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'profile', label: 'Profile' },
    { id: 'bookings', label: 'Booking' },
  ];

  return (
    <div className="space-y-4">
      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow p-6 sticky top-8">
        <div className="text-center mb-8">
          <div
            className="profile-avatar w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg"
            style={{
              background: userType === 'agent'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            }}
          >
            {getUserInitials()}
          </div>

          {/* Enhanced Name Display */}
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            {getUserDisplayName()}
          </h3>

          <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
            <span className="mr-1">{userType === 'agent' ? ' ' : ' '}</span>
            <span className="uppercase tracking-wide">{userType || 'Customer'} Profile</span>
          </div>

          {/* Additional User Info */}
          <div className="text-xs text-gray-400">
            {formatMobile(user?.mobile)}
          </div>

          {user?.email && (
            <div className="text-xs text-gray-400 mt-1 truncate">
              {user.email}
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${activeTab === item.id
                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500 transform scale-105'
                : 'text-gray-700 hover:bg-gray-50 hover:text-blue-500 hover:transform hover:scale-102'
                }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && (
                <span className="ml-auto text-blue-500">•</span>
              )}
            </button>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 mt-6 border-t pt-4 hover:transform hover:scale-102"
          >
            <span className="mr-3 text-lg"></span>
            <span className="font-medium">Logout</span>
          </button>

        </nav>

        {/* Enhanced Footer Info */}
        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-gray-400">
            Active since: {user?.lastLoginTime ?
              new Date(user.lastLoginTime).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short'
              }) :
              new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short'
              })
            }
          </p>
          {user?.registrationDate && (
            <p className="text-xs text-gray-400 mt-1">
              Member since: {new Date(user.registrationDate).toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric'
              })}
            </p>
          )}
        </div>
      </div>


    </div>
  );
};

export default Sidebar;