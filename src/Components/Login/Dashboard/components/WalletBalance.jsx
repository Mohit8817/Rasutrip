// components/WalletBalance.js - Updated with Agent/User Detection
import React, { useState, useEffect, useContext } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { getUniversalWalletBalance, WalletUtils } from '../../services/API';
import { AuthContext } from '../../../Context/AuthContext'; // Adjust path as needed

const WalletBalance = ({ className = '' }) => {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userType, setUserType] = useState('user');

    // Get user context if available
    const authContext = useContext(AuthContext);
    const { user } = authContext || {};

    const fetchWalletBalance = async () => {
        setLoading(true);
        setError('');

        try {
            // Detect user type from context or localStorage
            let detectedUserType = 'user';

            if (user && user.role) {
                // From AuthContext
                detectedUserType = user.role === 'agent' ? 'agent' : 'user';
            } else {
                // From utility function
                detectedUserType = WalletUtils.detectUserType();
            }

            setUserType(detectedUserType);

            // Call universal wallet balance API
            const result = await getUniversalWalletBalance(detectedUserType);

            if (result.success) {
                setBalance(result.balance);
                console.log(`✅ ${detectedUserType} wallet balance:`, result.balance);
            } else {
                setError(result.message || `Failed to fetch ${detectedUserType} wallet balance`);
            }
        } catch (err) {
            setError(err.message || 'Network error. Please try again.');
            console.error('Wallet balance fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletBalance();
    }, [user]); // Re-fetch when user changes

    // Get appropriate icon based on user type
    const getWalletIcon = () => {
        return userType === 'agent' ? ' ' : '';
    };

    // Get appropriate title based on user type
    const getWalletTitle = () => {
        return userType === 'agent' ? 'AGENT WALLET' : 'WALLET BALANCE';
    };

    // Get appropriate color scheme based on user type
    const getColorScheme = () => {
        return userType === 'agent'
            ? { bg: 'bg-primary', text: 'text-primary' }
            : { bg: 'bg-success', text: 'text-success' };
    };

    const colorScheme = getColorScheme();

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
                <div className="d-flex align-items-center">
                    <div className="me-3">
                        <div className={`p-2 ${colorScheme.bg} bg-opacity-10 rounded-circle`}>
                            <span className={colorScheme.text}>{getWalletIcon()}</span>
                        </div>
                    </div>
                    <div className="flex-grow-1">
                        <h6 className="text-muted mb-1 fw-bold small">{getWalletTitle()}</h6>
                        <div className="d-flex align-items-center">
                            <Spinner animation="border" size="sm" className="me-2" />
                            <span className="text-muted">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
                <div className="d-flex align-items-center">
                    <div className="me-3">
                        <div className="p-2 bg-danger bg-opacity-10 rounded-circle">
                            <span className="text-danger">❌</span>
                        </div>
                    </div>
                    <div className="flex-grow-1">
                        <h6 className="text-muted mb-1 fw-bold small">{getWalletTitle()}</h6>
                        <div className="d-flex align-items-center justify-content-between">
                            <span className="text-danger small">Error loading balance</span>
                            <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={fetchWalletBalance}
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
            <div className="d-flex align-items-center">
                <div className="me-3">
                    <div >
                        <span className={colorScheme.text} style={{ fontSize: '1.2rem' }}>
                            {getWalletIcon()}
                        </span>
                    </div>
                </div>
                <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                        <h6 className="text-muted mb-0 fw-bold small">{getWalletTitle()}</h6>

                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                        <h4 className={`${colorScheme.text} fw-bold mb-0`}>
                            {WalletUtils.formatCurrency(balance)}
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletBalance;