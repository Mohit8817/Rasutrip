import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setPassengers, updatePassenger } from '../../redux/Slices/PassengersSlice';
import countries from './countries.json';
import { fetchSSR } from '../APIS/FlightApi/FlightApi';
import moment from 'moment';

const TravellerInfo = ({ fareConfirmData, SelectedFare, Faresummary }) => {
  // Resolve current fareConfirm for oneway/roundtrip
  const tripType = localStorage.getItem('tripType') || 'oneway';
  let fareConfirm = fareConfirmData;
  if (tripType === 'roundtrip' && fareConfirm?.onward) {
    fareConfirm = fareConfirm.onward;
  }

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Read origin from selected flight
  let PassagerOrigin = null;
  try {
    if (tripType === 'oneway' || tripType === 'multicity') {
      const res = localStorage.getItem('selectedFlight');
      const SearchData = res ? JSON.parse(res) : null;
      PassagerOrigin = SearchData?.Segments?.[0]?.Origin || null;
    } else if (tripType === 'roundtrip') {
      const resOn = localStorage.getItem('selectedOnwardFlight');
      const fallback = resOn || localStorage.getItem('selectedFlight');
      const SearchData = fallback ? JSON.parse(fallback) : null;
      PassagerOrigin = SearchData?.Segments?.Origin || null;
    }
  } catch (e) {
    PassagerOrigin = null;
  }

  const passengersData = useSelector((s) => s.passengersData || []);
  const [loading, setLoading] = useState(false);

  // IMPORTANT: Per latest requirement, make DOB and Gender required for ALL passengers.
  // Lead-only fields stay the same (City, AddressLine1, ContactNo, Email).
  const flags = {
    passport: !!fareConfirm?.IsPassportRequiredAtBook,
    pan: !!fareConfirm?.IsPanRequiredAtBook,
    gstAllowed: !!fareConfirm?.GSTAllowed,
    gstMandatory: !!fareConfirm?.IsGSTMandatory
  };

  // Initialize passengers from FareBreakdown
  useEffect(() => {
    if (!fareConfirm) return;

    const createEmptyPassenger = (type, index) => ({
      type,
      Title: '',
      FirstName: '',
      LastName: '',
      PaxType: type === 'ADT' ? 1 : type === 'CHD' ? 2 : 3,
      DateOfBirth: '',
      Gender: '',               // now required for all
      PassportNo: '',
      PassportExpiry: '',
      Nationality: '',
      PassportIssue: '',
      PAN: '',
      AddressLine1: '',
      AddressLine2: '',
      City: '',
      CountryCode: PassagerOrigin?.CountryCode || 'IN',
      CountryName: PassagerOrigin?.CountryName || 'India',
      ContactNo: '',
      Email: '',
      IsLeadPax: index === 0 && type === 'ADT',
      GSTCompanyName: '',
      GSTCompanyAddress: '',
      GSTCompanyContactNumber: '',
      GSTNumber: '',
      GSTCompanyEmail: '',
      Baggage: [],
      Meal: [],
      Seat: []
    });

    const p = [];
    const adt = fareConfirm?.FareBreakdown?.ADT?.PassengerCount || 0;
    const chd = fareConfirm?.FareBreakdown?.CHD?.PassengerCount || 0;
    const inf = fareConfirm?.FareBreakdown?.INF?.PassengerCount || 0;

    for (let i = 0; i < adt; i++) p.push(createEmptyPassenger('ADT', i));
    for (let i = 0; i < chd; i++) p.push(createEmptyPassenger('CHD', i));
    for (let i = 0; i < inf; i++) p.push(createEmptyPassenger('INF', i));

    dispatch(setPassengers(p));
  }, [fareConfirm, dispatch]);

  const setField = (type, index, field, value) =>
    dispatch(updatePassenger({ type, index, field, value }));

  // Auto-gender mapper based on Title
  const inferGenderFromTitle = (title) => {
    if (!title) return '';
    const t = title.toLowerCase();
    if (t === 'mr' || t === 'mstr' || t === 'master') return '1';   // Male
    if (t === 'mrs' || t === 'ms' || t === 'miss' || t === 'kumari') return '2'; // Female
    return '';
  };

  const handleTitleChange = (type, index, title) => {
    setField(type, index, 'Title', title);
    const autoGender = inferGenderFromTitle(title);
    if (autoGender) {
      setField(type, index, 'Gender', autoGender);
    }
  };

  // ALL-PAX required validation for DOB + Gender. Lead-only for address/contact.
  const areAllRequiredFieldsFilled = () =>
    passengersData.every((p) => {
      const basic = p.Title?.trim() && p.FirstName?.trim() && p.LastName?.trim();
      const genderOk = !!p.Gender;            // required for all
      const dobOk = !!p.DateOfBirth;          // required for all

      const leadOk = p.IsLeadPax
        ? (p.AddressLine1?.trim() &&
           p.City?.trim() &&
           p.ContactNo?.trim() &&
           p.Email?.trim())
        : true;

      const passportOk =
        !flags.passport || (p.PassportNo && p.PassportExpiry && p.Nationality);
      const panOk = !flags.pan || !!p.PAN;

      const gstOk =
        !flags.gstMandatory || !p.IsLeadPax
          ? true
          : !!(p.GSTNumber && p.GSTCompanyName && p.GSTCompanyAddress && p.GSTCompanyContactNumber);

      return basic && genderOk && dobOk && leadOk && passportOk && panOk && gstOk;
    });

  const isContinueDisabled = !areAllRequiredFieldsFilled() || loading;

  // SSR payload
  const raw = localStorage.getItem('fareSummery');
  const summaryData = raw ? JSON.parse(raw) : null;

  const SSRPayload = useMemo(
    () => ({
      UserIp: localStorage.getItem('UserIp') || '',
      ResultIndex: summaryData?.FareId || '',
      PublishedPrice: summaryData?.PublishedPrice || '',
      SearchTokenId: localStorage.getItem('searchToken') || ''
    }),
    [summaryData]
  );

  const handleContinue = async () => {
    setLoading(true);
    try {
      const res = await fetchSSR(SSRPayload);
      localStorage.setItem('passengersData', JSON.stringify(passengersData));
      navigate('/addons', {
        state: {
          SSR: res?.Result || [],
          SelectedFare,
          passengersData,
          Faresummary
        }
      });
    } catch (e) {
      localStorage.setItem('passengersData', JSON.stringify(passengersData));
      navigate('/addons', {
        state: { SSR: [], SelectedFare, passengersData, Faresummary }
      });
    } finally {
      setLoading(false);
    }
  };

  const ErrorText = ({ show, text }) =>
    show ? <div className="text-danger small mt-1">{text}</div> : null;

  const blockHeader = (label) => (
    <div className="px-3 py-2 mb-3" style={{ background: '#f3f5f7', borderRadius: 8 }}>
      <h6 className="m-0 fw-bold">{label}</h6>
    </div>
  );

  const paxCounts = {
    ADT: fareConfirm?.FareBreakdown?.ADT?.PassengerCount || 0,
    CHD: fareConfirm?.FareBreakdown?.CHD?.PassengerCount || 0,
    INF: fareConfirm?.FareBreakdown?.INF?.PassengerCount || 0
  };

  const renderPassengerFields = (p, index, type) => {
    const isLead = !!p.IsLeadPax;
    const isAdult = type === 'ADT';
    const isChild = type === 'CHD';
    const isInfant = type === 'INF';

    // These fields are now required & visible for ALL pax
    const showDOB = true;
    const showGender = true;

    // Lead-only fields
    const showLeadContact = isLead;
    const showLeadAddress = isLead;

    const blockTitle =
      isAdult ? `Adult X ${paxCounts.ADT}` : isChild ? `Child X ${paxCounts.CHD}` : `Infant X ${paxCounts.INF}`;
    const rowTitle = isAdult ? `Adult${index + 1}` : isChild ? `Child${index + 1}` : `Infant${index + 1}`;

    return (
      <div key={`${type}-${index}`} className="mb-4">
        {index === 0 && blockHeader(blockTitle)}
        <div className="px-3">
          <h6 className="fw-bold mb-3">{rowTitle}</h6>

          <Row className="g-3">
            {/* Title */}
            <Col md={3}>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Select
                  value={p.Title || ''}
                  onChange={(e) => handleTitleChange(type, index, e.target.value)}
                  style={{ borderColor: p.Title ? '#ced4da' : '#dc3545' }}
                >
                  <option value="">Title</option>
                  {p.PaxType === 1 ? (
                    <>
                      <option value="Mr">Mr</option>
                      <option value="Ms">Ms</option>
                      <option value="Mrs">Mrs</option>
                    </>
                  ) : (
                    <>
                      <option value="Ms">Ms</option>
                      <option value="Mstr">Mstr</option>
                    </>
                  )}
                </Form.Select>
                <ErrorText show={!p.Title} text="Please select title" />
              </Form.Group>
            </Col>

            {/* First Name */}
            <Col md={3}>
              <Form.Group>
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  placeholder="First Name"
                  value={p.FirstName || ''}
                  onChange={(e) => setField(type, index, 'FirstName', e.target.value)}
                  style={{ borderColor: p.FirstName ? '#ced4da' : '#dc3545' }}
                />
                <ErrorText show={!p.FirstName} text="Please enter first name" />
              </Form.Group>
            </Col>

            {/* Last Name */}
            <Col md={3}>
              <Form.Group>
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  placeholder="Last Name"
                  value={p.LastName || ''}
                  onChange={(e) => setField(type, index, 'LastName', e.target.value)}
                  style={{ borderColor: p.LastName ? '#ced4da' : '#dc3545' }}
                />
                <ErrorText show={!p.LastName} text="Please enter last name" />
              </Form.Group>
            </Col>

            {/* DOB (now for all pax) */}
            {showDOB && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>DOB</Form.Label>
                  <Form.Control
                    type="date"
                    value={p.DateOfBirth || ''}
                    onChange={(e) => setField(type, index, 'DateOfBirth', e.target.value)}
                    style={{ borderColor: p.DateOfBirth ? '#ced4da' : '#dc3545', background: '#f3f5f7' }}
                    min={
                      p.PaxType === 1
                        ? moment().subtract(100, 'years').format('YYYY-MM-DD')
                        : p.PaxType === 2
                        ? moment().subtract(12, 'years').format('YYYY-MM-DD')
                        : moment().subtract(2, 'years').format('YYYY-MM-DD')
                    }
                    max={
                      p.PaxType === 1
                        ? moment().subtract(12, 'years').format('YYYY-MM-DD')
                        : p.PaxType === 2
                        ? moment().subtract(2, 'years').format('YYYY-MM-DD')
                        : moment().format('YYYY-MM-DD')
                    }
                  />
                  <ErrorText show={!p.DateOfBirth} text="Please enter dob" />
                </Form.Group>
              </Col>
            )}

            {/* Gender (now for all pax) */}
            {showGender && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    value={p.Gender || ''}
                    onChange={(e) => setField(type, index, 'Gender', e.target.value)}
                    style={{ borderColor: p.Gender ? '#ced4da' : '#dc3545' }}
                  >
                    <option value="">Select</option>
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                  </Form.Select>
                  <ErrorText show={!p.Gender} text="Please select gender" />
                </Form.Group>
              </Col>
            )}

            {/* Lead-only Address */}
            {showLeadAddress && (
              <>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      value={p.City || ''}
                      onChange={(e) => setField(type, index, 'City', e.target.value)}
                      style={{ borderColor: p.City ? '#ced4da' : '#dc3545' }}
                    />
                    <ErrorText show={!p.City} text="Please enter city" />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>AddressLine1</Form.Label>
                    <Form.Control
                      value={p.AddressLine1 || ''}
                      onChange={(e) => setField(type, index, 'AddressLine1', e.target.value)}
                      maxLength={28}
                      style={{ borderColor: p.AddressLine1 ? '#ced4da' : '#dc3545' }}
                    />
                    <ErrorText show={!p.AddressLine1} text="Please enter address" />
                  </Form.Group>
                </Col>
              </>
            )}

            {/* Lead-only Contact */}
            {showLeadContact && (
              <>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Contact Number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={p.ContactNo || ''}
                      onChange={(e) => setField(type, index, 'ContactNo', e.target.value)}
                      style={{ borderColor: p.ContactNo ? '#ced4da' : '#dc3545' }}
                    />
                    <ErrorText show={!p.ContactNo} text="Please enter contact number" />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={p.Email || ''}
                      onChange={(e) => setField(type, index, 'Email', e.target.value)}
                      style={{ borderColor: p.Email ? '#ced4da' : '#dc3545' }}
                    />
                    <ErrorText show={!p.Email} text="Please enter email" />
                  </Form.Group>
                </Col>
              </>
            )}

            {/* Optional global PAN/PASSPORT */}
            {flags.pan && (
              <Col md={3}>
                <Form.Group>
                  <Form.Label>PAN Number</Form.Label>
                  <Form.Control
                    value={p.PAN || ''}
                    onChange={(e) => setField(type, index, 'PAN', e.target.value)}
                    style={{ borderColor: p.PAN ? '#ced4da' : '#dc3545' }}
                  />
                </Form.Group>
              </Col>
            )}

            {flags.passport && (
              <>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Passport Number</Form.Label>
                    <Form.Control
                      value={p.PassportNo || ''}
                      onChange={(e) => setField(type, index, 'PassportNo', e.target.value)}
                      style={{ borderColor: p.PassportNo ? '#ced4da' : '#dc3545' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Passport Issue</Form.Label>
                    <Form.Control
                      type="date"
                      value={p.PassportIssue || ''}
                      onChange={(e) => setField(type, index, 'PassportIssue', e.target.value)}
                      style={{ borderColor: p.PassportIssue ? '#ced4da' : '#dc3545' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Passport Expiry</Form.Label>
                    <Form.Control
                      type="date"
                      value={p.PassportExpiry || ''}
                      onChange={(e) => setField(type, index, 'PassportExpiry', e.target.value)}
                      style={{ borderColor: p.PassportExpiry ? '#ced4da' : '#dc3545' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Nationality</Form.Label>
                    <Form.Select
                      value={p.Nationality || ''}
                      onChange={(e) => setField(type, index, 'Nationality', e.target.value)}
                      style={{ borderColor: p.Nationality ? '#ced4da' : '#dc3545' }}
                    >
                      <option value="">Select Nationality</option>
                      {countries.map((c) => (
                        <option key={c.CountryCode} value={c.CountryCode}>
                          {c.CountryName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </>
            )}
          </Row>
        </div>
      </div>
    );
  };

  const adults = passengersData.filter((p) => p.PaxType === 1);
  const children = passengersData.filter((p) => p.PaxType === 2);
  const infants = passengersData.filter((p) => p.PaxType === 3);

  const renderAllPassengers = () => (
    <>
      {adults.map((p, i) => renderPassengerFields(p, i, 'ADT'))}
      {children.map((p, i) => renderPassengerFields(p, i, 'CHD'))}
      {infants.map((p, i) => renderPassengerFields(p, i, 'INF'))}
    </>
  );

  return (
    <div className="container my-4">
      {/* Traveller Details */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <h5 className="fw-bold mb-2">Traveller Details</h5>
          <p className="text-muted small mb-4">
            Please make sure you enter the Name as per your Government photo id.
          </p>
          {renderAllPassengers()}
        </Card.Body>
      </Card>

      {/* Contact Details (informative UI) */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <h5 className="fw-bold mb-2">Contact Details</h5>
          <p className="text-muted small mb-4">
            Your ticket and flight details will be shared here
          </p>
          <Row className="g-3">
            <Col md={3}>
              <Form.Select defaultValue="91">
                <option value="91">India ( 91)</option>
                <option value="1">USA ( 1)</option>
                <option value="44">UK ( 44)</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Control placeholder="Mobile Number" />
              {/* <div className="text-danger small mt-1">Please enter mobile number</div> */}
            </Col>
            <Col md={5}>
              <Form.Control placeholder="Email" />
              {/* <div className="text-danger small mt-1">Please enter email</div> */}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* GST Card (Optional) */}
      {flags.gstAllowed && (
        <Card className="mb-4 shadow-sm border-0">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Use GSTIN for this booking(Optional)</h5>
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: '#ffc107',
                  color: '#000',
                  fontWeight: 700
                }}
              >
                ×
              </div>
            </div>
            <p className="text-muted small mt-3">
              Claim credit of GST charges. Your taxes may get updated post submitting your GST details.
            </p>
            <Row className="g-3">
              <Col md={4}>
                <Form.Control
                  placeholder="GST Number"
                  value={passengersData[0]?.GSTNumber || ''}
                  onChange={(e) => setField('ADT', 0, 'GSTNumber', e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  placeholder="Registered Company Name"
                  value={passengersData?.GSTCompanyName || ''}
                  onChange={(e) => setField('ADT', 0, 'GSTCompanyName', e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Form.Control
                  placeholder="Registered Contact No"
                  value={passengersData?.GSTCompanyContactNumber || ''}
                  onChange={(e) => setField('ADT', 0, 'GSTCompanyContactNumber', e.target.value)}
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  placeholder="Registered Email"
                  value={passengersData?.GSTCompanyEmail || ''}
                  onChange={(e) => setField('ADT', 0, 'GSTCompanyEmail', e.target.value)}
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  placeholder="Registered Address"
                  value={passengersData?.GSTCompanyAddress || ''}
                  onChange={(e) => setField('ADT', 0, 'GSTCompanyAddress', e.target.value)}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Continue */}
      <div className="text-start mt-3">
        <Button
          variant="primary"
          size="lg"
          disabled={isContinueDisabled}
          onClick={handleContinue}
          className={isContinueDisabled ? 'btn-danger' : ''}
          style={{
            transition: 'all .3s',
            ...(isContinueDisabled && {
              backgroundColor: '#dc3545',
              borderColor: '#dc3545',
              cursor: 'not-allowed'
            })
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
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
