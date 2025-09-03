// components/WalletBalance.js - Updated for User Only
import React, { useState, useEffect, useContext } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { getWalletBalance, WalletUtils } from '../../services/API';
import { AuthContext } from '../../../Context/AuthContext'; // Adjust path as needed

const WalletBalance = ({ className = '' }) => {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Get user context if available
    const authContext = useContext(AuthContext);
    const { user } = authContext || {};

    const fetchWalletBalance = async () => {
        setLoading(true);
        setError('');

        try {
            console.log(' Fetching user wallet balance...');

            // Call user wallet balance API only
            const result = await getWalletBalance();

            if (result.success) {
                setBalance(result.balance);
                console.log('✅ User wallet balance:', result.balance);
            } else {
                setError(result.message || 'Failed to fetch wallet balance');
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

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
                <div className="d-flex align-items-center">
                    <div className="me-3">

                    </div>
                    <div className="flex-grow-1">
                        <h6 className="text-muted mb-1 fw-bold small">WALLET BALANCE</h6>
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
                        <h6 className="text-muted mb-1 fw-bold small">WALLET BALANCE</h6>
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

                <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                        <h6 className="text-muted mb-0 fw-bold small">WALLET BALANCE</h6>

                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                        <h4 className="text-success fw-bold mb-0">
                            {WalletUtils.formatCurrency(balance)}
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletBalance;