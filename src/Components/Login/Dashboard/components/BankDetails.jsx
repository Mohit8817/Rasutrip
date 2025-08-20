// components/BankDetails.js - Bank Details Component for Agents
import React, { useState, useContext, useEffect } from 'react';
import { Button, Alert, Row, Col, Form, Card } from 'react-bootstrap';
import { AuthContext } from '../../../Context/AuthContext';

const BankDetails = () => {
    const { user } = useContext(AuthContext);

    const [bankDetails, setBankDetails] = useState({
        accHolderName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        accountType: 'savings'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Base URL - replace with your actual base URL
    const baseURL = process.env.REACT_APP_RASU_TRIP_LOCAL || 'https://api.rasutrip.com/api/v1';

    // Fetch existing bank details on component mount
    useEffect(() => {
        fetchBankDetails();
    }, []);

    const fetchBankDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${baseURL}/agent/bank-info`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${user?.token}`, // Adjust based on your auth implementation
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.data) {
                    setBankDetails({
                        accHolderName: data.data.accHolderName || '',
                        bankName: data.data.bankName || '',
                        accountNumber: data.data.accountNumber || '',
                        ifscCode: data.data.ifscCode || '',
                        branchName: data.data.branchName || '',
                        accountType: data.data.accountType || 'savings'
                    });
                }
            } else {
                console.error('Failed to fetch bank details');
            }
        } catch (error) {
            console.error('Error fetching bank details:', error);
            setError('Failed to load bank details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBankDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!bankDetails.accHolderName || !bankDetails.bankName ||
            !bankDetails.accountNumber || !bankDetails.ifscCode) {
            setError('Please fill in all required fields.');
            setMessage('');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setMessage('');

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('bankName', bankDetails.bankName);
            formData.append('accountNumber', bankDetails.accountNumber);
            formData.append('ifscCode', bankDetails.ifscCode);
            formData.append('accHolderName', bankDetails.accHolderName);

            // Add file if selected
            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            const response = await fetch(`${baseURL}/agent/upload-bank-details`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`, // Adjust based on your auth implementation
                    // Don't set Content-Type for FormData, let browser set it with boundary
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setMessage('Bank details saved successfully!');
                setIsEditing(false);
                setSelectedFile(null);

                // Refresh bank details after successful upload
                await fetchBankDetails();

                // Clear message after 3 seconds
                setTimeout(() => setMessage(''), 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to save bank details');
            }
        } catch (error) {
            console.error('Error saving bank details:', error);
            setError('Failed to save bank details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setMessage('');
        setError('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
        setSelectedFile(null);
        // Reset form data to original values
        fetchBankDetails();
    };

    if (loading && !isEditing) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border mb-4">
                <div className="p-4 border-b">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="text-2xl font-bold mb-1 text-gray-800">Bank Details</h2>
                            <p className="text-gray-600">Manage your banking information for payments</p>
                        </div>
                        <div className="text-end">
                            <span className="badge bg-primary text-xs px-3 py-2">
                                🏦 Agent Banking
                            </span>
                        </div>
                    </div>
                </div>

                {/* Success/Error Messages */}
                <div className="p-4 pb-0">
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                </div>

                {/* Bank Details Form */}
                <div className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            {/* Account Holder Name */}
                            <Col lg={6} className="mb-3">
                                <Form.Label className="text-muted small fw-bold">
                                    Account Holder Name *
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="accHolderName"
                                    value={bankDetails.accHolderName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter account holder name"
                                    className={!isEditing ? 'bg-light' : ''}
                                />
                            </Col>

                            {/* Bank Name */}
                            <Col lg={6} className="mb-3">
                                <Form.Label className="text-muted small fw-bold">
                                    Bank Name *
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="bankName"
                                    value={bankDetails.bankName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter bank name"
                                    className={!isEditing ? 'bg-light' : ''}
                                />
                            </Col>

                            {/* Account Number */}
                            <Col lg={6} className="mb-3">
                                <Form.Label className="text-muted small fw-bold">
                                    Account Number *
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="accountNumber"
                                    value={bankDetails.accountNumber}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter account number"
                                    className={!isEditing ? 'bg-light' : ''}
                                />
                            </Col>

                            {/* IFSC Code */}
                            <Col lg={6} className="mb-3">
                                <Form.Label className="text-muted small fw-bold">
                                    IFSC Code *
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="ifscCode"
                                    value={bankDetails.ifscCode}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter IFSC code"
                                    className={!isEditing ? 'bg-light' : ''}
                                />
                            </Col>

                            {/* Branch Name */}
                            <Col lg={6} className="mb-3">
                                <Form.Label className="text-muted small fw-bold">
                                    Branch Name
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="branchName"
                                    value={bankDetails.branchName}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter branch name"
                                    className={!isEditing ? 'bg-light' : ''}
                                />
                            </Col>

                            {/* Account Type */}
                            <Col lg={6} className="mb-3">
                                <Form.Label className="text-muted small fw-bold">
                                    Account Type
                                </Form.Label>
                                <Form.Select
                                    name="accountType"
                                    value={bankDetails.accountType}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={!isEditing ? 'bg-light' : ''}
                                >
                                    <option value="savings">Savings Account</option>
                                    <option value="current">Current Account</option>
                                    <option value="business">Business Account</option>
                                </Form.Select>
                            </Col>

                            {/* File Upload - Only show when editing */}
                            {isEditing && (
                                <Col lg={12} className="mb-3">
                                    <Form.Label className="text-muted small fw-bold">
                                        Upload Bank Document (Optional)
                                    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        className="mb-2"
                                    />
                                    <Form.Text className="text-muted">
                                        Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)
                                    </Form.Text>
                                    {selectedFile && (
                                        <div className="mt-2">
                                            <small className="text-success">
                                                ✅ Selected: {selectedFile.name}
                                            </small>
                                        </div>
                                    )}
                                </Col>
                            )}
                        </Row>

                        {/* Action Buttons */}
                        <div className="d-flex gap-3 mt-4">
                            {!isEditing ? (
                                <Button
                                    variant="primary"
                                    onClick={handleEdit}
                                    className="px-4"
                                >
                                    <span className="me-2">✏️</span>
                                    Edit Bank Details
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="success"
                                        type="submit"
                                        className="px-4"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <span className="me-2">💾</span>
                                                Save Details
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={handleCancel}
                                        className="px-4"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    </Form>
                </div>
            </div>

            {/* Security Notice */}
            <Card className="border-warning">
                <Card.Body className="bg-warning bg-opacity-10">
                    <div className="d-flex align-items-start">
                        <span className="text-warning me-3 fs-4">🔒</span>
                        <div>
                            <h6 className="text-warning fw-bold mb-2">Security Notice</h6>
                            <p className="text-muted small mb-0">
                                Your banking information is encrypted and securely stored.
                                Only authorized personnel can access this information for payment processing.
                            </p>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default BankDetails;