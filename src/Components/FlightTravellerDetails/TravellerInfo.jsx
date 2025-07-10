import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setPassengers, updatePassenger } from '../../redux/Slices/PassengersSlice';

import { LocationContext } from '../Context/LocationContext';
import { fetchSSR } from '../APIS/FlightApi/FlightApi';

const TravellerInfo = ({ fareConfirm, SelectedFare }) => {
    const { locationData } = useContext(LocationContext);
    console.log("  const { locationData } = useContext(LocationContext);")
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const passengersData = useSelector((state) => state.passengersData || []);
    console.log("passengersData", passengersData)
    const [contactDetails, setContactDetails] = useState({
        countryCode: '91',
        mobile: '',
        email: ''
    });

    // Initialize passengers based on fare breakdown
    useEffect(() => {
        if (!fareConfirm) return;
        const createEmptyPassenger = (type, index) => ({
            type,
            Title: '',
            FirstName: '',
            LastName: '',
            PaxType: type === 'ADT' ? 1 : type === 'CHD' ? 2 : 3,
            DateOfBirth: '',
            Gender: '',
            PassportNo: '',
            PassportExpiry: '',
            Nationality: '',
            PassportIssue: '',
            PAN: '',
            AddressLine1: '',
            AddressLine2: '',
            City: '',
            CountryCode: '',
            CountryName: '',
            ContactNo: '',
            Email: '',
            IsLeadPax: index === 0 && type === 'ADT',
            FFAirline: '',
            FFNumber: '',
            documentId: '',
            Baggage: [],
            Meal: [],
            Seat: [],
            GSTCompanyName: '',
            GSTCompanyAddress: '',
            GSTCompanyContactNumber: '',
            GSTNumber: '',
            GSTCompanyEmail: ''
        });

        const passengers = [];

        // Add Adults
        const adultCount = fareConfirm?.FareBreakdown?.ADT?.PassengerCount || 0;
        for (let i = 0; i < adultCount; i++) {
            passengers.push(createEmptyPassenger('ADT', i));
        }

        // Add Children
        const childCount = fareConfirm?.FareBreakdown?.CHD?.PassengerCount || 0;
        for (let i = 0; i < childCount; i++) {
            passengers.push(createEmptyPassenger('CHD', i));
        }

        // Add Infants
        const infantCount = fareConfirm?.FareBreakdown?.INF?.PassengerCount || 0;
        for (let i = 0; i < infantCount; i++) {
            passengers.push(createEmptyPassenger('INF', i));
        }

        dispatch(setPassengers(passengers));
    }, [dispatch, fareConfirm, SelectedFare]);

    const handlePassengerChange = (type, passengerIndex, field, value) => {
        console.log("Updating Passenger :", value, { type, passengerIndex, field, value });
        dispatch(updatePassenger({ type, index: passengerIndex, field, value }));
    };


    const handleContactChange = (field, value) => {
        setContactDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const SSRPayload = useMemo(() => ({
        UserIp: localStorage.getItem("UserIp") || "",
        ResultIndex: SelectedFare?.FareId || "",
        PublishedPrice: SelectedFare?.PublishedPrice,
        SearchTokenId: localStorage.getItem("searchToken") || ""
    }), [SelectedFare]);
    const handleContinue = async () => {
        setLoading(true);
        try {
            const res = await fetchSSR(SSRPayload);
            navigate('/addons', { state: { SSR: res?.Result || [] } });
        } catch (error) {
            console.error("API call failed:", error);
        } finally {
            setLoading(false);
        }
    };



    const areAllRequiredFieldsFilled = () => {
        return passengersData.every(passenger => {
            // Basic required fields for all passengers
            const basicFieldsFilled =
                passenger.Title?.trim() &&
                passenger.FirstName?.trim() &&
                passenger.LastName?.trim() &&
                passenger.Gender?.trim() &&
                passenger.ContactNo?.trim() &&
                passenger.Email?.trim();

            // Check DOB if required
            const dobRequired =
                (passenger.PaxType === 1 && (fareConfirm?.IsADTDOBRequired || fareConfirm?.IsAdultDOBMandatory)) ||
                (passenger.PaxType === 2 && fareConfirm?.IsCHDDOBRequired) ||
                (passenger.PaxType === 3 && fareConfirm?.IsINFTDOBRequired);

            const dobFilled = !dobRequired || passenger.DateOfBirth;

            // Check passport if required
            const passportRequired = fareConfirm?.IsPassportRequiredAtBook;
            const passportFilled = !passportRequired ||
                (passenger.PassportNo && passenger.PassportExpiry && passenger.Nationality);

            // Check PAN if required
            const panRequired = fareConfirm?.IsPanRequiredAtBook;
            const panFilled = !panRequired || passenger.PAN;

            // Check GST if required (only for lead passenger)
            const gstRequired = fareConfirm?.IsGSTMandatory && passenger.IsLeadPax;
            const gstFilled = !gstRequired ||
                (passenger.GSTNumber &&
                    passenger.GSTCompanyName &&
                    passenger.GSTCompanyAddress &&
                    passenger.GSTCompanyContactNumber);

            return basicFieldsFilled && dobFilled && passportFilled && panFilled && gstFilled;
        });
    };

    // Check contact details
    // const areContactDetailsFilled =
    //     contactDetails.mobile &&
    //     contactDetails.email;


    // Combine all checks
    const isContinueDisabled =
        !areAllRequiredFieldsFilled() ||
        // !areContactDetailsFilled() ||
        loading;



    const renderPassengerFields = (passenger, index, type) => {
        const isAdult = type === 'ADT';
        const isChild = type === 'CHD';
        const isInfant = type === 'INF';

        // Determine required fields based on fareConfirm
        const requireDOB = (isAdult && (fareConfirm?.IsADTDOBRequired || fareConfirm?.IsAdultDOBMandatory)) ||
            (isChild && fareConfirm?.IsCHDDOBRequired) ||
            (isInfant && fareConfirm?.IsINFTDOBRequired);

        const requirePassport = fareConfirm?.IsPassportRequiredAtBook;
        const requirePAN = fareConfirm?.IsPanRequiredAtBook;
        const requireGST = fareConfirm?.IsGSTMandatory && passenger.IsLeadPax;

        // Helper component for required field label
        const RequiredLabel = ({ children }) => (
            <span className="d-flex align-items-center">
                {children} <span className="text-danger ms-1">*</span>
            </span>
        );

        return (
            <div key={passenger.Id} className="mb-4 border-bottom pb-3">
                <h6 className="fw-bold">
                    {isAdult ? 'Adult' : isChild ? 'Child' : 'Infant'} {index + 1}
                    {passenger.IsLeadPax && " (Lead Passenger)"}
                </h6>

                <Row className="g-3 mt-2">
                    {/* Personal Information */}
                    <Col md={2}>
                        <Form.Group>
                            <Form.Label><RequiredLabel>Title</RequiredLabel></Form.Label>
                            <Form.Select
                                value={passenger.Title || ''}
                                onChange={(e) => handlePassengerChange(type, index, 'Title', e.target.value)}
                                required
                            >
                                <option value="">Select</option>
                                <option value="Mr">Mr</option>
                                <option value="Ms">Ms</option>
                                <option value="Mrs">Mrs</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={3}>
                        <Form.Group>
                            <Form.Label><RequiredLabel>First Name</RequiredLabel></Form.Label>
                            <Form.Control
                                placeholder="First Name"
                                value={passenger.FirstName || ''}
                                onChange={(e) => handlePassengerChange(type, index, 'FirstName', e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col md={3}>
                        <Form.Group>
                            <Form.Label><RequiredLabel>Last Name</RequiredLabel></Form.Label>
                            <Form.Control
                                placeholder="Last Name"
                                value={passenger.LastName || ''}
                                onChange={(e) => handlePassengerChange(type, index, 'LastName', e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>

                    {/* Date of Birth - Conditional */}
                    {requireDOB && (
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label><RequiredLabel>Date of Birth</RequiredLabel></Form.Label>
                                <Form.Control
                                    type="date"
                                    value={passenger.DateOfBirth || ''}
                                    onChange={(e) => handlePassengerChange(type, index, 'DateOfBirth', e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    )}

                    <Col md={3}>
                        <Form.Group>
                            <Form.Label><RequiredLabel>Gender</RequiredLabel></Form.Label>
                            <Form.Select
                                value={passenger.Gender || ''}
                                onChange={(e) => handlePassengerChange(type, index, 'Gender', e.target.value)}
                                required
                            >
                                <option value="">Select</option>
                                <option value="1">Male</option>
                                <option value="2">Female</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    {/* Document Information */}
                    {requirePassport && (
                        <>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label><RequiredLabel>Passport Number</RequiredLabel></Form.Label>
                                    <Form.Control
                                        value={passenger.PassportNo || ''}
                                        onChange={(e) => handlePassengerChange(type, index, 'PassportNo', e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label><RequiredLabel>Passport Expiry</RequiredLabel></Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={passenger.PassportExpiry || ''}
                                        onChange={(e) => handlePassengerChange(type, index, 'PassportExpiry', e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label><RequiredLabel>Nationality</RequiredLabel></Form.Label>
                                    <Form.Control
                                        value={passenger.Nationality || ''}
                                        onChange={(e) => handlePassengerChange(type, index, 'Nationality', e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </>
                    )}

                    {requirePAN && (
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label><RequiredLabel>PAN Number</RequiredLabel></Form.Label>
                                <Form.Control
                                    value={passenger.PAN || ''}
                                    onChange={(e) => handlePassengerChange(type, index, 'PAN', e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    )}

                    {/* Contact Information */}
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>
                                {isAdult ? <RequiredLabel>Contact Number</RequiredLabel> : 'Contact Number'}
                            </Form.Label>
                            <Form.Control
                                type="tel"
                                value={passenger.ContactNo || ''}
                                onChange={(e) => handlePassengerChange(type, index, 'ContactNo', e.target.value)}
                                required={isAdult}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>
                                {isAdult ? <RequiredLabel>Email</RequiredLabel> : 'Email'}
                            </Form.Label>
                            <Form.Control
                                type="email"
                                value={passenger.Email || ''}
                                onChange={(e) => handlePassengerChange(type, index, 'Email', e.target.value)}
                                required={isAdult}
                            />
                        </Form.Group>
                    </Col>

                    {/* GST Information - Only for lead passenger */}
                    {fareConfirm?.GSTAllowed && passenger.IsLeadPax && (
                        <>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label> <RequiredLabel>GST Number</RequiredLabel> </Form.Label>
                                    <Form.Control
                                        value={passenger.GSTNumber || ''}
                                        onChange={(e) => handlePassengerChange(type, index, 'GSTNumber', e.target.value)}
                                        required={requireGST}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label><RequiredLabel>Company Name</RequiredLabel></Form.Label>
                                    <Form.Control
                                        value={passenger.GSTCompanyName || ''}
                                        onChange={(e) => handlePassengerChange(type, index, 'GSTCompanyName', e.target.value)}
                                        required={requireGST}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label><RequiredLabel>Company Address</RequiredLabel></Form.Label>
                                    <Form.Control
                                        value={passenger.GSTCompanyAddress || ''}
                                        onChange={(e) => handlePassengerChange(type, index, 'GSTCompanyAddress', e.target.value)}
                                        required={requireGST}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label> <RequiredLabel>Company Contact</RequiredLabel> </Form.Label>
                                    <Form.Control
                                        value={passenger.GSTCompanyContactNumber || ''}
                                        onChange={(e) => handlePassengerChange(type, index, 'GSTCompanyContactNumber', e.target.value)}
                                        required={requireGST}
                                    />
                                </Form.Group>
                            </Col>
                        </>
                    )
                    }
                </Row>
            </div>
        );
    };

    const renderPassengerSections = () => {
        const adults = passengersData.filter(p => p.PaxType === 1);
        const children = passengersData.filter(p => p.PaxType === 2);
        const infants = passengersData.filter(p => p.PaxType === 3);

        return [
            ...adults.map((passenger, index) => renderPassengerFields(passenger, index, 'ADT')),
            ...children.map((passenger, index) => renderPassengerFields(passenger, index, 'CHD')),
            ...infants.map((passenger, index) => renderPassengerFields(passenger, index, 'INF'))
        ];
    };

    return (
        <div className="container my-4">
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body>
                    <h5 className="fw-bold mb-2">Traveller Details</h5>
                    <p className="text-muted small mb-4">
                        Please enter names as per the Government-issued photo ID.
                    </p>

                    {renderPassengerSections()}
                </Card.Body>
            </Card>

            <Card className="mb-4 shadow-sm border-0">
                <Card.Body>
                    <h6 className="fw-bold mb-2 text-danger">
                        <FaEnvelope className="me-2 text-danger" />
                        Your ticket and flight details will be shared here
                    </h6>
                    <hr />
                    <Row className="g-3">
                        <Col md={3}>
                            <Form.Select
                                value={contactDetails.countryCode}
                                onChange={(e) => handleContactChange('countryCode', e.target.value)}
                            >
                                <option value="91">India (+91)</option>
                                <option value="1">USA (+1)</option>
                                <option value="44">UK (+44)</option>
                            </Form.Select>
                        </Col>
                        <Col md={4}>
                            <Form.Control
                                type="tel"
                                placeholder="Mobile Number"
                                value={contactDetails.mobile}
                                onChange={(e) => handleContactChange('mobile', e.target.value)}
                                required
                            />
                        </Col>
                        <Col md={5}>
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                value={contactDetails.email}
                                onChange={(e) => handleContactChange('email', e.target.value)}
                                required
                            />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <div className="text-start mt-4">
                <Button
                    variant="primary"
                    size="lg"
                    disabled={isContinueDisabled}
                    onClick={handleContinue}
                    className={isContinueDisabled ? "btn-danger" : ""}
                    style={{
                        transition: 'all 0.3s ease',
                        ...(isContinueDisabled && {
                            backgroundColor: '#dc3545',
                            borderColor: '#dc3545',
                            cursor: 'not-allowed'
                        })
                    }}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                        </>
                    ) : (
                        'Continue Booking'
                    )}
                </Button>

                {isContinueDisabled && (
                    <div className="text-danger mt-2">
                        Please fill all required fields marked with * to continue
                    </div>
                )}
            </div>
        </div>
    );
};

export default TravellerInfo;