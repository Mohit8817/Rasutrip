// components/WalletBalance.js
import React, { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { getWalletBalance, WalletUtils } from '../../services/userApi';

const WalletBalance = ({ className = '' }) => {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchWalletBalance = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await getWalletBalance();

            if (result.success) {
                setBalance(result.balance);
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
    }, []);

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
                <div className="d-flex align-items-center">
                    <div className="me-3">
                        <div className="p-2 bg-success bg-opacity-10 rounded-circle">
                            <span className="text-success"></span>
                        </div>
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
                    <h6 className="text-muted mb-1 fw-bold small">WALLET BALANCE</h6>
                    <div className="d-flex align-items-center justify-content-between">
                        <h4 className="text-success fw-bold mb-0">
                            {WalletUtils.formatCurrency(balance)}
                        </h4>

                    </div>
                    <small className="text-muted">
                        Last updated: {new Date().toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </small>
                </div>
            </div>
        </div>
    );
};

export default WalletBalance;