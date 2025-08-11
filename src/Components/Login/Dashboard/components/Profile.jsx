import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { AuthContext } from '../../../Context/AuthContext';

const Profile = () => {
    const { user, userType } = useContext(AuthContext);
    const navigate = useNavigate();

    const getUserInitials = () => {
        if (user?.name) {
            return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        } else if (user?.mobile) {
            // Get last 2 digits from mobile number
            const cleanMobile = user.mobile.replace(/\D/g, '');
            return cleanMobile.slice(-2);
        }
        return 'U';
    };

    const formatMobile = (mobile) => {
        if (!mobile) return '';
        // Remove country code and format
        const cleaned = mobile.replace(/^\+?91/, '').replace(/\D/g, '');
        if (cleaned.length >= 10) {
            return `+91 ${cleaned.slice(-10, -5)} ${cleaned.slice(-5)}`;
        }
        return mobile;
    };

    // If no user is logged in, show login prompt
    if (!user) {
        return (
            <div className="bg-white rounded-lg shadow p-6 text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Please Login</h2>
                <p className="text-gray-600 mb-4">You need to login to view your profile.</p>
                <Button
                    variant="primary"
                    onClick={() => navigate('/')}
                >
                    Go to Login
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-0">Profile Information</h2>
            </div>

            <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-content-center text-white text-3xl font-bold mb-4"
                    style={{
                        width: '96px',
                        height: '96px',
                        background: userType === 'agent'
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    }}>
                    {getUserInitials()}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {user?.name || formatMobile(user?.mobile) || 'User'}
                </h3>
                <span className={`badge ${userType === 'agent' ? 'bg-primary' : 'bg-success'} text-uppercase`}>
                    {userType || 'Customer'}
                </span>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="mb-4">
                        <div>
                            <label className="form-label text-muted small">Account Type</label>
                            <div className="d-flex align-items-center p-3 bg-light rounded">
                                <span className={`me-2 ${userType === 'agent' ? 'text-primary' : 'text-success'}`}>
                                    {userType === 'agent' ? '👔' : '👤'}
                                </span>
                                <span className="text-capitalize fw-medium">{userType || 'Customer'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label text-muted small">Mobile Number</label>
                        <div className="d-flex align-items-center p-3 bg-light rounded">
                            <span className="text-muted me-2">📱</span>
                            <span>{formatMobile(user?.mobile)}</span>
                        </div>
                    </div>

                    {user?.email && (
                        <div className="mb-4">
                            <label className="form-label text-muted small">Email</label>
                            <div className="d-flex align-items-center p-3 bg-light rounded">
                                <span className="text-muted me-2">✉️</span>
                                <span>{user.email}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-md-6">
                    {user?.name && (
                        <div className="mb-4">
                            <label className="form-label text-muted small">Full Name</label>
                            <div className="p-3 bg-light rounded">
                                <span>{user.name}</span>
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="form-label text-muted small">Registration Date</label>
                        <div className="p-3 bg-light rounded">
                            <span>
                                {user?.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })
                                    : 'N/A'
                                }
                            </span>
                        </div>
                    </div>

                    {user?.agentId && (
                        <div className="mb-4">
                            <label className="form-label text-muted small">Agent ID</label>
                            <div className="p-3 bg-light rounded">
                                <span className="font-monospace">{user.agentId}</span>
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="form-label text-muted small">Login Status</label>
                        <div className="p-3 bg-light rounded">
                            <span className="badge bg-success">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Actions */}
            <div className="mt-4 pt-4 border-top">
                <div className="d-flex gap-2 justify-content-center">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                    >
                        Go to Dashboard
                    </Button>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => navigate('/')}
                    >
                        Home
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Profile;