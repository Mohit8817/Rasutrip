// components/BankDetails.js - Bank Details Component for Agents (Updated to use Financial Service)
import React, { useState, useContext, useEffect } from 'react';
import { Button, Alert, Row, Col, Form, Card } from 'react-bootstrap';
import { AuthContext } from '../../../Context/AuthContext';
import { BankService, BankUtils } from '../../services/API';


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
    const [validationErrors, setValidationErrors] = useState({});

    // Fetch existing bank details on component mount
    useEffect(() => {
        fetchBankDetails();
    }, []);

    const fetchBankDetails = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await BankService.getBankDetails();

            if (response.success && response.data) {
                setBankDetails({
                    accHolderName: response.data.accHolderName || '',
                    bankName: response.data.bankName || '',
                    accountNumber: response.data.accountNumber || '',
                    ifscCode: response.data.ifscCode || '',
                    branchName: response.data.branchName || '',
                    accountType: response.data.accountType || 'savings'
                });
            }
        } catch (error) {
            console.error('Error fetching bank details:', error);
            setError(error.message || 'Failed to load bank details');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Format specific fields
        let formattedValue = value;
        if (name === 'ifscCode') {
            formattedValue = BankUtils.formatIFSCCode(value);
        } else if (name === 'accountNumber') {
            formattedValue = BankUtils.formatAccountNumber(value);
        }

        setBankDetails(prev => ({
            ...prev,
            [name]: formattedValue
        }));

        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size should be less than 5MB');
                return;
            }

            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please select a valid file format (PDF, JPG, PNG, DOC, DOCX)');
                return;
            }
        }

        setSelectedFile(file);
        setError(''); // Clear any previous file errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate bank details
        const validation = BankUtils.validateBankDetails(bankDetails);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            setError('Please fix the validation errors below');
            setMessage('');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setMessage('');
            setValidationErrors({});

            // Prepare bank data
            const bankData = {
                bankName: bankDetails.bankName,
                accountNumber: bankDetails.accountNumber,
                ifscCode: bankDetails.ifscCode,
                accHolderName: bankDetails.accHolderName,
                branchName: bankDetails.branchName,
                accountType: bankDetails.accountType
            };

            const response = await BankService.uploadBankDetails(bankData, selectedFile);

            if (response.success) {
                setMessage(response.message || 'Bank details saved successfully!');
                setIsEditing(false);
                setSelectedFile(null);

                // Refresh bank details after successful upload
                await fetchBankDetails();

                // Clear message after 3 seconds
                setTimeout(() => setMessage(''), 3000);
            } else {
                setError(response.message || 'Failed to save bank details');
            }
        } catch (error) {
            console.error('Error saving bank details:', error);
            setError(error.message || 'Failed to save bank details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setMessage('');
        setError('');
        setValidationErrors({});
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
        setSelectedFile(null);
        setValidationErrors({});
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
                            <h4 className="text-2xl font-bold mb-1 text-gray-800">Bank Details</h4>
                            <p className="text-gray-600">Manage your banking information for payments</p>
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
                                    isInvalid={!!validationErrors.accHolderName}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.accHolderName}
                                </Form.Control.Feedback>
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
                                    isInvalid={!!validationErrors.bankName}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.bankName}
                                </Form.Control.Feedback>
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
                                    isInvalid={!!validationErrors.accountNumber}
                                    maxLength="18"
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.accountNumber}
                                </Form.Control.Feedback>
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
                                    isInvalid={!!validationErrors.ifscCode}
                                    maxLength="11"
                                    style={{ textTransform: 'uppercase' }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.ifscCode}
                                </Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    Example: SBIN0001234
                                </Form.Text>
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
                                                ✅ Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
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
                                    variant="danger"
                                    onClick={handleEdit}
                                    className="px-4 btn-red"
                                >
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

                        {/* Bank Details Summary - Only show when not editing and have data */}
                        {!isEditing && (bankDetails.accHolderName || bankDetails.bankName) && (
                            <div className="mt-4 p-3 bg-light rounded">
                                <h6 className="text-muted mb-2">Current Bank Details:</h6>
                                <div className="row">
                                    <div className="col-md-6">
                                        <small className="text-muted d-block">Account Holder:</small>
                                        <strong>{bankDetails.accHolderName || 'N/A'}</strong>
                                    </div>
                                    <div className="col-md-6">
                                        <small className="text-muted d-block">Bank Name:</small>
                                        <strong>{bankDetails.bankName || 'N/A'}</strong>
                                    </div>
                                    <div className="col-md-6 mt-2">
                                        <small className="text-muted d-block">Account Number:</small>
                                        <strong>
                                            {bankDetails.accountNumber ?
                                                `****${bankDetails.accountNumber.slice(-4)}` : 'N/A'}
                                        </strong>
                                    </div>
                                    <div className="col-md-6 mt-2">
                                        <small className="text-muted d-block">IFSC Code:</small>
                                        <strong>{bankDetails.ifscCode || 'N/A'}</strong>
                                    </div>
                                    {bankDetails.branchName && (
                                        <div className="col-md-6 mt-2">
                                            <small className="text-muted d-block">Branch:</small>
                                            <strong>{bankDetails.branchName}</strong>
                                        </div>
                                    )}
                                    <div className="col-md-6 mt-2">
                                        <small className="text-muted d-block">Account Type:</small>
                                        <strong className="text-capitalize">
                                            {bankDetails.accountType.replace('_', ' ')}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default BankDetails;