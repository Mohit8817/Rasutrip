// components/Profile.js - Updated with col-4 header and col-8 info layout
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Alert, Row, Col } from 'react-bootstrap';
import { AuthContext } from '../../../Context/AuthContext';
import WalletBalance from './WalletBalance';

const Profile = () => {
    const {
        user,
        getUserFullName,
        getUserInitials,
        getUserMobile
    } = useContext(AuthContext);

    const navigate = useNavigate();

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    if (!user) {
        return (
            <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-2xl font-bold mb-4">
                    ?
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Please Login</h2>
                <p className="text-gray-600 mb-4">You need to login to view your profile.</p>
                <Button variant="primary" onClick={() => navigate('/')}>
                    Go to Login
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Wallet Balance Section - Top Priority */}
            <Row>
                <Col lg={12}>
                    <WalletBalance className="mb-4" />
                </Col>
            </Row>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-sm border">
                {/* Success/Error Messages */}
                {message && <Alert variant="success" className="m-4 mb-0">{message}</Alert>}
                {error && <Alert variant="danger" className="m-4 mb-0">{error}</Alert>}

                <div className="p-4">
                    <Row>
                        {/* Profile Header - Col 4 */}
                        <Col lg={4} className="text-center mb-4 mb-lg-0 pt-5">
                            <div
                                className="mx-auto rounded-circle d-flex align-items-center justify-content-center text-white text-3xl font-bold mb-3 shadow-lg"
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    fontSize: '2.2rem',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                            >
                                {getUserInitials()}
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                {getUserFullName()}
                            </h3>
                        </Col>

                        {/* Profile Information - Col 8 */}
                        <Col lg={8}>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label text-muted small fw-bold">Full Name</label>
                                    <div className="p-3 bg-light rounded border">
                                        <div className="d-flex align-items-center">
                                            <span className="text-primary me-2">👤</span>
                                            <span className="fw-medium">{getUserFullName()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <label className="form-label text-muted small fw-bold">Mobile Number</label>
                                    <div className="p-3 bg-light rounded border">
                                        <div className="d-flex align-items-center">
                                            <span className="text-success me-2">📱</span>
                                            <span>{getUserMobile()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <label className="form-label text-muted small fw-bold">Last Login</label>
                                    <div className="p-3 bg-light rounded border">
                                        <div className="d-flex align-items-center">
                                            <span className="text-secondary me-2">⏰</span>
                                            <span>
                                                {user?.lastLoginTime ?
                                                    new Date(user.lastLoginTime).toLocaleString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) :
                                                    'Just now'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
};

export default Profile;