import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Button, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Wallet, TrendingUp, TrendingDown, Download, Search, Calendar, Filter, RefreshCw } from 'lucide-react';
import baseURL from "../../../../Services/Config";

const AgentWalletHistory = () => {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [walletData, setWalletData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch wallet data from API
    const fetchWalletData = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            // Get token from localStorage
            const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('access_token');
            
            if (!token) {
                throw new Error('Authentication token not found. Please login again.');
            }

            const response = await fetch(`${baseURL}/agent/wallet-history`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('access_token');
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Assuming the API response structure
            if (data.success || data.status === 'success') {
                setWalletData(data.walletSummary || data.data?.walletSummary || {
                    currentBalance: data.data?.currentBalance || 0,
                    thisMonthEarnings: data.data?.thisMonthEarnings || 0,
                    pendingWithdrawals: data.data?.pendingWithdrawals || 0,
                    totalEarnings: data.data?.totalEarnings || 0,
                    totalWithdrawals: data.data?.totalWithdrawals || 0,
                    availableBalance: data.data?.availableBalance || 0
                });
                
                setTransactions(data.transactions || data.data?.transactions || []);
            } else {
                throw new Error(data.message || 'Failed to fetch wallet data');
            }
        } catch (err) {
            console.error('Error fetching wallet data:', err);
            setError(err.message || 'Failed to load wallet data. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    // Filter transactions
    const filteredTransactions = transactions.filter(transaction => {
        const matchesFilter = selectedFilter === 'all' || transaction.type === selectedFilter;
        const matchesSearch = (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (transaction.bookingId || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = !dateFilter || (transaction.date && transaction.date.includes(dateFilter));
        
        return matchesFilter && matchesSearch && matchesDate;
    });

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'success':
                return <Badge bg="success">Completed</Badge>;
            case 'pending':
                return <Badge bg="warning">Pending</Badge>;
            case 'failed':
            case 'cancelled':
                return <Badge bg="danger">Failed</Badge>;
            default:
                return <Badge bg="secondary">Unknown</Badge>;
        }
    };

    const getTypeBadge = (type) => {
        return type === 'credit' ? 
            <Badge bg="success" className="me-2">Credit</Badge> : 
            <Badge bg="danger" className="me-2">Debit</Badge>;
    };

    const formatAmount = (amount, type) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        const formatted = `₹${numAmount?.toLocaleString() || '0'}`;
        return type === 'credit' ? `+${formatted}` : `-${formatted}`;
    };

    const handleRefresh = () => {
        fetchWalletData(true);
    };

    const clearFilters = () => {
        setSelectedFilter('all');
        setSearchTerm('');
        setDateFilter('');
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Loading wallet data...</p>
                </div>
            </div>
        );
    }

    if (error && !walletData) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Error Loading Wallet Data</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={() => fetchWalletData()}>
                    <RefreshCw size={16} className="me-2" />
                    Try Again
                </Button>
            </Alert>
        );
    }

    return (
        <div className="agent-wallet-history">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <Wallet className="me-2" size={28} />
                        Wallet History
                    </h2>
                    <p className="text-muted mb-0">Manage your earnings and transactions</p>
                </div>
                <div className="d-flex gap-2">
                    <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw size={16} className={`me-2 ${refreshing ? 'spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button variant="primary" size="sm">
                        <Download size={16} className="me-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="warning" dismissible>
                    {error}
                </Alert>
            )}

            {/* Wallet Summary Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm wallet-summary-card">
                        <Card.Body className="text-center">
                            <div className="wallet-icon-wrapper bg-success bg-opacity-10 rounded-circle mx-auto mb-3" 
                                 style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Wallet size={24} className="text-success" />
                            </div>
                            <h4 className="text-success mb-1">
                                ₹{(walletData?.currentBalance || 0).toLocaleString()}
                            </h4>
                            <small className="text-muted">Current Balance</small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm wallet-summary-card">
                        <Card.Body className="text-center">
                            <div className="wallet-icon-wrapper bg-info bg-opacity-10 rounded-circle mx-auto mb-3"
                                 style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={24} className="text-info" />
                            </div>
                            <h4 className="text-info mb-1">
                                ₹{(walletData?.thisMonthEarnings || 0).toLocaleString()}
                            </h4>
                            <small className="text-muted">This Month Earnings</small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm wallet-summary-card">
                        <Card.Body className="text-center">
                            <div className="wallet-icon-wrapper bg-warning bg-opacity-10 rounded-circle mx-auto mb-3"
                                 style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingDown size={24} className="text-warning" />
                            </div>
                            <h4 className="text-warning mb-1">
                                ₹{(walletData?.pendingWithdrawals || 0).toLocaleString()}
                            </h4>
                            <small className="text-muted">Pending Withdrawals</small>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-3">
                    <Card className="h-100 border-0 shadow-sm wallet-summary-card">
                        <Card.Body className="text-center">
                            <div className="wallet-icon-wrapper bg-primary bg-opacity-10 rounded-circle mx-auto mb-3"
                                 style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Calendar size={24} className="text-primary" />
                            </div>
                            <h4 className="text-primary mb-1">
                                ₹{(walletData?.totalEarnings || 0).toLocaleString()}
                            </h4>
                            <small className="text-muted">Total Earnings</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <Row className="mb-4">
                <Col>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h5 className="mb-3">Quick Actions</h5>
                            <div className="d-flex flex-wrap gap-2">
                                <Button variant="success" size="sm">
                                    <TrendingUp size={16} className="me-2" />
                                    Add Money
                                </Button>
                                <Button variant="primary" size="sm">
                                    <TrendingDown size={16} className="me-2" />
                                    Withdraw Funds
                                </Button>
                                <Button variant="outline-secondary" size="sm">
                                    <Download size={16} className="me-2" />
                                    Download Statement
                                </Button>
                                <Button variant="outline-info" size="sm">
                                    <Calendar size={16} className="me-2" />
                                    Set Auto-Withdrawal
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters and Search */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row className="align-items-end">
                        <Col lg={3} md={6} className="mb-3 mb-lg-0">
                            <Form.Label>Filter by Type</Form.Label>
                            <Form.Select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
                                <option value="all">All Transactions</option>
                                <option value="credit">Credit Only</option>
                                <option value="debit">Debit Only</option>
                            </Form.Select>
                        </Col>
                        
                        <Col lg={3} md={6} className="mb-3 mb-lg-0">
                            <Form.Label>Date Filter</Form.Label>
                            <Form.Control
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </Col>
                        
                        <Col lg={4} md={8} className="mb-3 mb-lg-0">
                            <Form.Label>Search</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <Search size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search by description or booking ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        
                        <Col lg={2} md={4}>
                            <Button variant="outline-primary" className="w-100" onClick={clearFilters}>
                                <Filter size={16} className="me-2" />
                                Clear Filters
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Transaction History */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Recent Transactions</h5>
                        <Badge bg="light" text="dark">{filteredTransactions.length} transactions</Badge>
                    </div>
                </Card.Header>
                
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table className="mb-0" hover>
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 px-4 py-3">Date & Time</th>
                                    <th className="border-0 py-3">Description</th>
                                    <th className="border-0 py-3">Booking ID</th>
                                    <th className="border-0 py-3">Type</th>
                                    <th className="border-0 py-3">Amount</th>
                                    <th className="border-0 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((transaction, index) => (
                                    <tr key={transaction.id || index}>
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="fw-medium">
                                                    {transaction.date || 'N/A'}
                                                </div>
                                                <small className="text-muted">
                                                    {transaction.time || ''}
                                                </small>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div>
                                                <div className="fw-medium">
                                                    {transaction.description || 'No description'}
                                                </div>
                                                <small className="text-muted text-capitalize">
                                                    {transaction.category || 'general'}
                                                </small>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <code className="bg-light px-2 py-1 rounded">
                                                {transaction.bookingId || transaction.reference_id || 'N/A'}
                                            </code>
                                        </td>
                                        <td className="py-3">
                                            {getTypeBadge(transaction.type)}
                                        </td>
                                        <td className="py-3">
                                            <span className={`fw-bold ${transaction.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                                                {formatAmount(transaction.amount, transaction.type)}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            {getStatusBadge(transaction.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    {filteredTransactions.length === 0 && (
                        <div className="text-center py-5">
                            <Wallet size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">No transactions found</h5>
                            <p className="text-muted">
                                {transactions.length === 0 
                                    ? 'No transactions available yet' 
                                    : 'Try adjusting your search or filter criteria'
                                }
                            </p>
                        </div>
                    )}
                </Card.Body>

                {filteredTransactions.length > 0 && (
                    <Card.Footer className="bg-white border-top">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                Showing {filteredTransactions.length} of {transactions.length} transactions
                            </small>
                            <Button variant="outline-primary" size="sm">
                                Load More
                            </Button>
                        </div>
                    </Card.Footer>
                )}
            </Card>

            <style jsx>{`
                .agent-wallet-history {
                    padding: 0;
                }
                
                .wallet-summary-card {
                    transition: transform 0.2s ease-in-out;
                    cursor: pointer;
                }
                
                .wallet-summary-card:hover {
                    transform: translateY(-2px);
                }
                
                .wallet-icon-wrapper {
                    transition: all 0.3s ease;
                }
                
                .wallet-summary-card:hover .wallet-icon-wrapper {
                    transform: scale(1.1);
                }

                .spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @media (max-width: 768px) {
                    .agent-wallet-history h2 {
                        font-size: 1.5rem;
                    }
                    
                    .table-responsive {
                        font-size: 0.9rem;
                    }
                    
                    .btn-group-sm > .btn, .btn-sm {
                        padding: 0.375rem 0.5rem;
                        font-size: 0.8rem;
                    }
                }
                
                .code {
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                }
                
                tbody tr:hover {
                    background-color: rgba(0,123,255,0.05);
                }
                
                .quick-actions .btn {
                    white-space: nowrap;
                }
            `}</style>
        </div>
    );
};

export default AgentWalletHistory;