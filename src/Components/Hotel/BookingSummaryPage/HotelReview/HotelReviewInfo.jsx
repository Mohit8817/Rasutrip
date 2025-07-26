import React from "react";
import { Card, Row, Col, Button, Form } from "react-bootstrap";
import {
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaBed,
    FaMoon,
    FaEdit,
    FaBuilding,
} from "react-icons/fa";
import hotelImage from "../../../../assest/hotel1.jpg";
import { useNavigate, useLocation } from "react-router-dom";

const HotelReviewInfo = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        hotel,
        room,
        roomDetails,
        guestInputs,
        priceDetails,
        email,
        mobile,
        gstData, // ✅ GST pulled from state
        payload,
    } = location.state || {};
    console.log("✅ GST Data in  Page:", gstData);


    const totalGuests =
        guestInputs?.reduce(
            (acc, room) => acc + room.adults.length + room.children.length,
            0
        ) || 0;

    const handleContinue = () => {
        const totalPrice = roomDetails?.Amount || 0;

        const vendorCommission = priceDetails?.vendorCommission || 0;
        const couponDiscount = priceDetails?.discount || 0;
        const userIp = "49.36.217.215"; // You can dynamically detect this if needed

        const mapPassengers = guestInputs?.map((roomGuests, idx) => {
            const roomIndex = idx + 1;

            const hotelPassenger = [...roomGuests.adults, ...roomGuests.children].map((guest, index) => ({
                Title: guest.title || null,
                FirstName: guest.firstName || null,
                MiddleName: guest.middleName || "",
                LastName: guest.lastName || null,
                Phoneno: mobile || null,
                Email: email || null,
                PaxType: guest.paxType || 1, // 1 = Adult, 2 = Child, 3 = Infant
                LeadPassenger: index === 0 ? "true" : "false",
                Age: guest.age || 0,
                PassportNo: guest.passportNo || null,
                PassportIssueDate: guest.passportIssueDate || null,
                PassportExpDate: guest.passportExpDate || null,
                PAN: guest.pan || "AWNPD1189N", // or fetch from input
                GSTCompanyAddress: gstData?.address || null,
                GSTCompanyContactNumber: gstData?.contactNo || null,
                GSTCompanyEmail: gstData?.email || null,
                GSTCompanyName: gstData?.companyName || null,
                GSTNumber: gstData?.gstNumber || null,
            }));

            return {
                RoomIndex: roomIndex,
                HotelPassenger: hotelPassenger,
            };
        });

        const hotelBookingDetails = {
            ResultIndex: hotel?.ResultIndex ?? "",
            HotelCode: hotel?.HotelCode ?? "",
            HotelName: hotel?.HotelName ?? hotel?.name ?? "",
            SearchTokenId: hotel?.SearchTokenId ?? "",
            vendorCommission: vendorCommission,
            CouponDiscount: couponDiscount,
            GuestNationality: "IN",
            NoOfRooms: hotel?.rooms?.toString() || "1",
            ClientReferenceNo: "Ref123",
            IsVoucherBooking: "true",
            HotelRoomsDetails: mapPassengers || [],
            UserIp: userIp,
        };

        console.log("🚀 Final Payload to Payment API:", JSON.stringify(hotelBookingDetails, null, 2));

        navigate("/HotelPayment", {
            state: {
                hotel,
                room,
                roomDetails,
                guestInputs,
                email,
                mobile,
                gstData,
                totalGuests,
                priceDetails,
                totalPrice,
                hotelBookingDetails,
                payload,
                reviewData: {
                    ...gstData,
                    panNumber: guestInputs?.[0]?.adults?.[0]?.pan || "", // 👈 Add PAN explicitly
                }
            },
        });
    };

    if (!hotel || !room || !guestInputs) {
        return (
            <div className="p-4 text-danger text-center">
                ❌ Missing booking review data. Please go back and complete previous steps.
            </div>
        );
    }

    return (
        <div className="container my-4">
            {/* Hotel Details */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <Row className="align-items-center">
                        <Col>
                            <h5 className="fw-bold mb-3">{hotel?.HotelName || hotel?.name}</h5>
                            <p className="text-muted d-flex mb-2">
                                <FaMapMarkerAlt className="me-1 text-danger" />
                                {hotel?.location || "No location info"}
                            </p>
                        </Col>
                        <Col xs="auto">
                            <div className="text-warning fs-5">
                                {"⭐".repeat(hotel?.rating || 3)}
                            </div>
                        </Col>
                    </Row>

                    <hr />

                    <Row className="align-items-center mb-3">
                        <Col md={3}>
                            <img
                                src={hotel?.image || hotelImage}
                                alt="Hotel"
                                className="img-fluid rounded"
                                style={{ height: "180px", objectFit: "cover" }}
                            />
                        </Col>

                        <Col md={9}>
                            <Row>
                                <Col md={3} className="mb-3">
                                    <FaCalendarAlt className="me-1" />
                                    <strong> Check-in</strong>
                                    <div className="text-dark fw-semibold">
                                        {hotel?.checkInDate || "N/A"}
                                    </div>
                                </Col>

                                <Col md={3} className="mb-3">
                                    <FaMoon className="me-1" />
                                    <strong> Nights</strong>
                                    <div className="mt-1 fw-semibold">{hotel?.nights || 1}</div>
                                </Col>

                                <Col md={3} className="mb-3">
                                    <FaCalendarAlt className="me-1" />
                                    <strong> Check-out</strong>
                                    <div className="text-dark fw-semibold">
                                        {hotel?.checkOutDate || "N/A"}
                                    </div>
                                </Col>

                                <Col md={3} className="mb-3">
                                    <FaBed className="me-1" />
                                    <strong> Rooms & Guests</strong>
                                    <div className="fw-semibold mt-1">
                                        {hotel?.rooms || 1} Room(s), {totalGuests} Guest(s)
                                    </div>
                                </Col>
                            </Row>

                            <hr className="my-3" />

                            <Row>
                                <Col md={4}>
                                    <span className="text-muted">Room Type</span>
                                    <div className="fw-bold">
                                        {room?.RoomTypeName || "Apartment"}
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <span className="text-muted">No. of Guests</span>
                                    <div className="fw-bold">{totalGuests}</div>
                                </Col>
                                <Col md={4}>
                                    <span className="text-muted">Cancellation Policy</span>
                                    <div className="fw-bold text-primary">
                                        {room?.CancellationPolicy || "Free Cancellation"}
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Guest Details */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">Primary Guest Details</h6>
                        <span
                            role="button"
                            title="Edit"
                            onClick={() =>
                                navigate("/guest-details", {
                                    state: { hotel, room, roomDetails, guestInputs, email, mobile, gstData },
                                })
                            }
                        >
                            <FaEdit className="text-danger cursor-pointer" />
                        </span>
                    </div>

                    <div className="border rounded p-3">
                        <Row className="fw-bold border-bottom pb-2 mb-2 text-muted small">
                            <Col md={4}>E-mail</Col>
                            <Col md={4}>Contact No.</Col>
                            <Col md={4}>Guest Details</Col>
                        </Row>

                        <Row className="mb-2">
                            <Col md={4}>{email}</Col>
                            <Col md={4}>+91 {mobile}</Col>
                            <Col md={4}>
                                {guestInputs?.map((room, roomIndex) => (
                                    <div key={roomIndex}>
                                        {room.adults.map((guest, i) => (
                                            <div key={`adult-${roomIndex}-${i}`}>
                                                {guest.title} {guest.firstName} {guest.lastName}
                                            </div>
                                        ))}
                                        {room.children.map((guest, i) => (
                                            <div key={`child-${roomIndex}-${i}`}>
                                                {guest.title} {guest.firstName} {guest.lastName}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </Col>
                        </Row>
                    </div>

                    {/* GST Details Display */}
                    {gstData && gstData.gstNumber && (
                        <div className="border rounded p-3 mt-4">
                            <h6 className="fw-bold mb-3">
                                <FaBuilding className="me-2 text-primary" />
                                GST Details
                            </h6>
                            <Row>
                                <Col md={4}><strong>GST Number:</strong><br />{gstData.gstNumber}</Col>
                                <Col md={4}><strong>Company Name:</strong><br />{gstData.companyName}</Col>
                                <Col md={4}><strong>Contact:</strong><br />{gstData.contactNo}</Col>
                            </Row>
                            <Row className="mt-3">
                                <Col md={4}><strong>Email:</strong><br />{gstData.email}</Col>
                                <Col md={4}><strong>Address:</strong><br />{gstData.address}</Col>
                                <Col md={4}><strong>panNumber:</strong><br />{gstData.panNumber}</Col>
                            </Row>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Terms & Continue */}
            <div className="mb-3">
                <Form.Check
                    type="checkbox"
                    label={
                        <>
                            I have read and accept the{" "}
                            <a href="/terms-and-conditions" className="text-danger text-decoration-none">
                                Terms & Conditions
                            </a>.
                        </>
                    }
                    defaultChecked
                />
            </div>

            <div className="text-start">
                <Button variant="primary" className="btn-red" onClick={handleContinue}>
                    Continue Payment
                </Button>
            </div>
        </div>
    );
};

export default HotelReviewInfo;
