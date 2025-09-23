import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Form,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Download,
  Search,
  Calendar,
  Filter,
  RefreshCw,
} from "lucide-react";
import baseURL from "../../../../Services/Config";

const AgentWalletHistory = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
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
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(`${baseURL}/agent/wallet-history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("access_token");
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.payments && Array.isArray(data.payments)) {
        // Transform API data to match component expectations
        const transformedTransactions = data.payments.map((payment) => ({
          id: payment._id,
          date: new Date(payment.createdAt).toLocaleDateString("en-IN"),
          time: new Date(payment.createdAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          description:
            payment.note ||
            `${payment.paymentMode} for ${payment.type} booking`,
          bookingId: payment.note ? payment.note.match(/\d+/)?.[0] : "N/A",
          type: payment.transactionType, // 'credit' or 'debit'
          amount: payment.amount,
          status: payment.isSuccess ? "completed" : "failed",
          category: payment.type, // flight, hotel, bus
          paymentMode: payment.paymentMode,
          source: payment.source,
        }));

        setTransactions(transformedTransactions);

        // Calculate wallet summary from transactions
        const totalEarnings = data.payments
          .filter((p) => p.transactionType === "credit" && p.isSuccess)
          .reduce((sum, p) => sum + p.amount, 0);

        const totalWithdrawals = data.payments
          .filter((p) => p.transactionType === "debit" && p.isSuccess)
          .reduce((sum, p) => sum + p.amount, 0);

        const currentBalance = totalEarnings - totalWithdrawals;

        // This month earnings
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthEarnings = data.payments
          .filter((p) => {
            const paymentDate = new Date(p.createdAt);
            return (
              p.transactionType === "credit" &&
              p.isSuccess &&
              paymentDate.getMonth() === currentMonth &&
              paymentDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, p) => sum + p.amount, 0);

        const pendingWithdrawals = data.payments
          .filter((p) => p.transactionType === "debit" && !p.isSuccess)
          .reduce((sum, p) => sum + p.amount, 0);

        setWalletData({
          currentBalance,
          thisMonthEarnings,
          pendingWithdrawals,
          totalEarnings,
          totalWithdrawals,
          availableBalance: currentBalance - pendingWithdrawals,
        });
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setError(err.message || "Failed to load wallet data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesFilter =
      selectedFilter === "all" || transaction.type === selectedFilter;
    const matchesSearch =
      (transaction.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (transaction.bookingId || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (transaction.category || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesDate =
      !dateFilter ||
      (transaction.date && transaction.date.includes(dateFilter));

    return matchesFilter && matchesSearch && matchesDate;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return <Badge bg="success">Completed</Badge>;
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "failed":
      case "cancelled":
        return <Badge bg="danger">Failed</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    return type === "credit" ? (
      <Badge bg="success" className="me-2">
        Credit
      </Badge>
    ) : (
      <Badge bg="danger" className="me-2">
        Debit
      </Badge>
    );
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "flight":
        return "";
      case "hotel":
        return "";
      case "bus":
        return "";
      default:
        return "";
    }
  };

  const formatAmount = (amount, type) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    const formatted = `₹${numAmount?.toLocaleString("en-IN") || "0"}`;
    return type === "credit" ? `+${formatted}` : `-${formatted}`;
  };

  const handleRefresh = () => {
    fetchWalletData(true);
  };

  const clearFilters = () => {
    setSelectedFilter("all");
    setSearchTerm("");
    setDateFilter("");
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
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
          <h4 className="mb-1">Wallet History</h4>
          <p className="text-muted mb-0">
            Manage your earnings and transactions
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="warning" dismissible>
          {error}
        </Alert>
      )}

      {/* Wallet Summary Cards */}
      {walletData && (
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm wallet-summary-card">
              <Card.Body className="text-center">
                <div
                  className="wallet-icon-wrapper bg-success bg-opacity-10 rounded-circle mx-auto mb-3"
                  style={{
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Wallet size={24} className="text-success" />
                </div>
                <h4 className="text-success mb-1">
                  ₹{(walletData.currentBalance || 0).toLocaleString("en-IN")}
                </h4>
                <small className="text-muted">Current Balance</small>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm wallet-summary-card">
              <Card.Body className="text-center">
                <div
                  className="wallet-icon-wrapper bg-info bg-opacity-10 rounded-circle mx-auto mb-3"
                  style={{
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUp size={24} className="text-info" />
                </div>
                <h4 className="text-info mb-1">
                  ₹{(walletData.thisMonthEarnings || 0).toLocaleString("en-IN")}
                </h4>
                <small className="text-muted">This Month Earnings</small>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm wallet-summary-card">
              <Card.Body className="text-center">
                <div
                  className="wallet-icon-wrapper bg-warning bg-opacity-10 rounded-circle mx-auto mb-3"
                  style={{
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingDown size={24} className="text-warning" />
                </div>
                <h4 className="text-warning mb-1">
                  ₹
                  {(walletData.pendingWithdrawals || 0).toLocaleString("en-IN")}
                </h4>
                <small className="text-muted">Pending Withdrawals</small>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6} className="mb-3">
            <Card className="h-100 border-0 shadow-sm wallet-summary-card">
              <Card.Body className="text-center">
                <div
                  className="wallet-icon-wrapper bg-primary bg-opacity-10 rounded-circle mx-auto mb-3"
                  style={{
                    width: "60px",
                    height: "60px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Calendar size={24} className="text-primary" />
                </div>
                <h4 className="text-primary mb-1">
                  ₹{(walletData.totalEarnings || 0).toLocaleString("en-IN")}
                </h4>
                <small className="text-muted">Total Earnings</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Transaction History */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Recent Transactions</h5>
            <Badge bg="light" text="dark">
              {filteredTransactions.length} transactions
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="p-4">
            <div className="flex flex-col gap-4">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id || index}
                    className="border rounded-lg shadow-sm p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white"
                  >
                    {/* Left Section: Date & Time */}
                    <div className="text-sm text-gray-700 min-w-[120px]">
                      <div className="font-medium">
                        {transaction.date || "N/A"}
                      </div>
                      <small className="text-gray-500">
                        {transaction.time || ""}
                      </small>
                    </div>

                    {/* Middle Section: Description */}
                    <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-2">
                      <span className="text-lg">
                        {getCategoryIcon(transaction.category)}
                      </span>
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">
                          {transaction.description || "No description"}
                        </div>
                        <small className="text-gray-500 text-capitalize">
                          {transaction.category || "general"} •{" "}
                          {transaction.paymentMode || "Online Payment"}
                        </small>
                      </div>
                    </div>

                    {/* Right Section: Booking ID, Type, Amount, Status */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3 text-sm text-gray-700 mt-2 md:mt-0">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                        #{transaction.bookingId || "N/A"}
                      </span>
                      <span>{getTypeBadge(transaction.type)}</span>
                      <span
                        className={`font-bold ${
                          transaction.type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatAmount(transaction.amount, transaction.type)}
                      </span>
                      <span>{getStatusBadge(transaction.status)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-5">
                  <Wallet size={48} className="text-muted mb-3" />
                  <h5 className="text-muted">No transactions found</h5>
                  <p className="text-muted">
                    {transactions.length === 0
                      ? "No transactions available yet"
                      : "Try adjusting your search or filter criteria"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card.Body>

        {/* 
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
                          {transaction.date || "N/A"}
                        </div>
                        <small className="text-muted">
                          {transaction.time || ""}
                        </small>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center">
                        <span className="me-2">
                          {getCategoryIcon(transaction.category)}
                        </span>
                        <div>
                          <div className="fw-medium">
                            {transaction.description || "No description"}
                          </div>
                          <small className="text-muted text-capitalize">
                            {transaction.category || "general"} •{" "}
                            {transaction.paymentMode}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <code className="bg-light px-2 py-1 rounded">
                        #{transaction.bookingId}
                      </code>
                    </td>
                    <td className="py-3">{getTypeBadge(transaction.type)}</td>
                    <td className="py-3">
                      <span
                        className={`fw-bold ${
                          transaction.type === "credit"
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
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
                  ? "No transactions available yet"
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          )}
        </Card.Body> */}
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
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .agent-wallet-history h2 {
            font-size: 1.5rem;
          }

          .table-responsive {
            font-size: 0.9rem;
          }

          .btn-group-sm > .btn,
          .btn-sm {
            padding: 0.375rem 0.5rem;
            font-size: 0.8rem;
          }
        }

        .code {
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
        }

        tbody tr:hover {
          background-color: rgba(0, 123, 255, 0.05);
        }

        .quick-actions .btn {
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default AgentWalletHistory;
