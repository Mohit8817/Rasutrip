import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaHome, FaDownload, FaBus } from "react-icons/fa";
import { toast } from "react-toastify";
import { downloadBusInvoice } from "../../APIS/BusApi/BusApis";

const BookingConfirm = ({ booking }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const handleDownload = async (type, bookingId) => {
    try {
      const token = localStorage.getItem("token"); // tumhare login ka JWT token

      const url =
        type === "invoice"
          ? `https://api.rasutrip.com/api/v1/airservice/download/invoice/bus/${bookingId}`
          : `https://api.rasutrip.com/api/v1/airservice/download/e-ticket/bus/${bookingId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Yaha token dena jaruri hai
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = type === "invoice" ? "invoice.pdf" : "e-ticket.pdf";
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  // Extract data from navigation state
  const {
    paymentId,
    orderId,
    bookingDetails,
    finalAmount,
    validationResult,
    bookingResult,
    extractedBookingId,
    appliedCouponData,
    couponDiscount = 0,
  } = state || {};

  // Load html2pdf library dynamically
  const loadHtml2Pdf = () => {
    return new Promise((resolve, reject) => {
      if (window.html2pdf) {
        resolve(window.html2pdf);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => {
        resolve(window.html2pdf);
      };
      script.onerror = () => {
        reject(new Error("Failed to load html2pdf library"));
      };
      document.head.appendChild(script);
    });
  };

  // Show success toast on mount
  useEffect(() => {
    if (extractedBookingId || bookingResult) {
      toast.success("🎉 Bus booking confirmed successfully!", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [extractedBookingId, bookingResult]);

  // Updated fetchInvoiceData function with correct API mapping
  const fetchInvoiceData = async () => {
    if (loadingInvoice || invoiceData) return; // Prevent multiple calls

    setLoadingInvoice(true);
    setInvoiceError("");

    try {
      const bookingId =
        extractedBookingId ||
        bookingResult?.BookingId ||
        bookingResult?.bookingId;

      if (!bookingId) {
        throw new Error("Booking ID not found");
      }

      const invoicePayload = {
        UserIp: "122.161.64.143",
        SearchTokenId:
          bookingDetails?.searchTokenId ||
          bookingDetails?.bus?.SearchTokenId ||
          "",
        BookingId: bookingId,
        receiverEmail: bookingDetails?.contactData?.email || "",
      };

      console.log("Fetching bus invoice with payload:", invoicePayload);

      const response = await downloadBusInvoice(invoicePayload);

      if (response && (response.data || response)) {
        const invoiceDetails = response.data || response;
        setInvoiceData(invoiceDetails);
        console.log("Bus invoice data fetched successfully:", invoiceDetails);
      } else {
        throw new Error("Invalid invoice response");
      }
    } catch (error) {
      console.error("Error fetching bus invoice:", error);
      setInvoiceError(error.message || "Failed to fetch invoice data");

      // Create fallback invoice data only when API completely fails
      const fallbackInvoiceData = generateFallbackBusInvoiceData();
      setInvoiceData(fallbackInvoiceData);
    } finally {
      setLoadingInvoice(false);
    }
  };

  // Generate fallback bus invoice data if API fails
  const generateFallbackBusInvoiceData = () => {
    const now = new Date();
    const bookingId =
      extractedBookingId || bookingResult?.BookingId || `BUS${Date.now()}`;
    const invoiceNumber = `TW/${Math.floor(Math.random() * 9999)}/${Math.floor(
      Math.random() * 9999
    )}`;

    const passengerName =
      bookingDetails?.contactData?.name ||
      `${bookingDetails?.passengerData?.[0]?.firstName || "Guest"} ${
        bookingDetails?.passengerData?.[0]?.lastName || "Name"
      }`;

    const baseFare = Math.round((finalAmount || 0) * 0.8);
    const taxes = Math.round((finalAmount || 0) * 0.1);
    const serviceCharges = Math.round((finalAmount || 0) * 0.05);

    return {
      invoiceId: invoiceNumber,
      invoiceDate: now.toISOString(),
      bookingId: bookingId,
      TicketNo: bookingId,
      source: bookingDetails?.fromCity || "Source",
      destination: bookingDetails?.toCity || "Destination",
      departureTime: bookingDetails?.bus?.departureTime || now.toISOString(),
      arrivalTime:
        bookingDetails?.bus?.arrivalTime ||
        new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      busType: bookingDetails?.bus?.busType || "AC Bus",

      supplierDetails: {
        name: "RASUTRIP WEBSOFT TECHNOLOGIES LLP",
        mobile: "+91 9266424809",
        email: "booking@rasutrip.com",
        pan: "ABLFR7635L",
        state: "Uttar Pradesh",
        companyRegisteredNumber: "U72900UP2019LLP024578",
      },

      receiverDetails: {
        name: passengerName,
        phone: bookingDetails?.contactData?.mobile || "N/A",
      },

      passenger: bookingDetails?.passengerData?.map((passenger, index) => ({
        Title: passenger.title || "Mr",
        FirstName: passenger.firstName || "Guest",
        LastName: passenger.lastName || "Name",
        Age: passenger.age || "N/A",
        SeatName:
          bookingDetails?.selectedSeats?.[index]?.SeatName ||
          `Seat ${index + 1}`,
        Seat: {
          SeatFare: Math.round(
            (finalAmount || 0) / (bookingDetails?.passengerData?.length || 1)
          ),
        },
      })) || [
        {
          Title: "Mr",
          FirstName: "Guest",
          LastName: "Name",
          Age: "N/A",
          SeatName: "Seat 1",
          Seat: { SeatFare: finalAmount || 0 },
        },
      ],

      fareDetails: {
        NoOfSeats: bookingDetails?.selectedSeats?.length || 1,
        baseFare: baseFare,
        taxes: taxes,
        serviceCharges: serviceCharges,
        couponDiscount: couponDiscount || 0,
      },

      vendorCommission: serviceCharges,
      totalPayable: finalAmount || 0,
      invoiceTotal: finalAmount || 0,

      boardingPointdetails: {
        CityPointName: "Boarding Point",
        CityPointLocation: bookingDetails?.fromCity || "Location",
        CityPointLandmark: "Main Bus Stand",
        CityPointTime: bookingDetails?.bus?.departureTime || now.toISOString(),
        CityPointContactNumber: "+91 9266424809",
      },

      droppingPointdetails: [
        {
          CityPointName: "Dropping Point",
          CityPointLocation: bookingDetails?.toCity || "Location",
          CityPointTime:
            bookingDetails?.bus?.arrivalTime ||
            new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
        },
      ],

      isFallback: true,
    };
  };

  // Corrected Bus Invoice HTML generator using direct API response
  const generateBusInvoiceHTML = (apiInvoiceData) => {
    const formatDate = (dateStr) => {
      try {
        return new Date(dateStr).toLocaleDateString("en-IN");
      } catch {
        return dateStr || "N/A";
      }
    };

    const formatTime = (dateStr) => {
      try {
        return new Date(dateStr).toLocaleString("en-IN");
      } catch {
        return dateStr || "N/A";
      }
    };

    // Generate passenger rows from API data
    let passengerRows = "";
    if (apiInvoiceData.passenger && apiInvoiceData.passenger.length > 0) {
      apiInvoiceData.passenger.forEach((p, i) => {
        passengerRows += `
                <tr>
                    <td>${apiInvoiceData.TicketNo || "N/A"}</td>
                    <td>${apiInvoiceData.source || "N/A"} - ${
          apiInvoiceData.destination || "N/A"
        }</td>
                    <td>${p.Title || ""} ${p.FirstName || ""} ${
          p.LastName || ""
        }</td>
                    <td>${p.Age || "N/A"}</td>
                    <td>${p.SeatName || p.Seat?.SeatName || "N/A"}</td>
                    <td>₹ ${(p.Seat?.SeatFare || 0).toLocaleString()}</td>
                </tr>
            `;
      });
    }

    return `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ccc; padding: 20px; background-color: #fff;">
            <h2 style="text-align: center; color: #2c3e50; margin-bottom: 30px; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Tax Invoice (Bus Booking)</h2>

            <!-- Company & Customer Details -->
            <table style="width: 100%; margin-bottom: 30px; font-size: 14px;">
                <tr>
                    <td style="vertical-align: top; width: 50%;">
                        <strong>From:</strong> ${
                          apiInvoiceData.supplierDetails?.name ||
                          "RASUTRIP WEBSOFT TECHNOLOGIES LLP"
                        }<br />
                        <strong>Mobile:</strong> ${
                          apiInvoiceData.supplierDetails?.mobile ||
                          "+91 9266424809"
                        }<br />
                        <strong>Email:</strong> ${
                          apiInvoiceData.supplierDetails?.email ||
                          "booking@rasutrip.com"
                        }<br />
                        <strong>PAN Number:</strong> ${
                          apiInvoiceData.supplierDetails?.pan || "ABLFR7635L"
                        }<br />
                        <strong>State:</strong> ${
                          apiInvoiceData.supplierDetails?.state ||
                          "Uttar Pradesh"
                        }
                    </td>
                    <td style="text-align: right; vertical-align: top; width: 50%;">
                        <strong>Passenger Name:</strong> ${
                          apiInvoiceData.receiverDetails?.name || "Guest Name"
                        }<br />
                        <strong>Phone:</strong> ${
                          apiInvoiceData.receiverDetails?.phone || "N/A"
                        }
                    </td>
                </tr>
            </table>

            <!-- Invoice & Trip Details -->
            <table style="width: 100%; font-size: 14px; margin-bottom: 30px; border-collapse: collapse;" border="1" cellpadding="8" cellspacing="0">
                <tr style="background-color: #f8f9fa;">
                    <td><strong>Invoice Number:</strong> ${
                      apiInvoiceData.invoiceNumber || "N/A"
                    }</td>
                    <td><strong>Invoice Date:</strong> ${formatDate(
                      apiInvoiceData.invoiceDate
                    )}</td>
                </tr>
                <tr>
                    <td><strong>Booking ID:</strong> ${
                      apiInvoiceData.bookingId || "N/A"
                    }</td>
                    <td><strong>Ticket No:</strong> ${
                      apiInvoiceData.TicketNo || "N/A"
                    }</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                    <td><strong>From:</strong> ${
                      apiInvoiceData.source || "N/A"
                    }</td>
                    <td><strong>To:</strong> ${
                      apiInvoiceData.destination || "N/A"
                    }</td>
                </tr>
                <tr>
                    <td><strong>Departure:</strong> ${formatTime(
                      apiInvoiceData.departureTime
                    )}</td>
                    <td><strong>Arrival:</strong> ${formatTime(
                      apiInvoiceData.arrivalTime
                    )}</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                    <td colspan="2"><strong>Bus Type:</strong> ${
                      apiInvoiceData.busType || "N/A"
                    }</td>
                </tr>
            </table>

            <!-- Passenger Details -->
            <h3 style="color: #2c3e50; margin-top: 30px; margin-bottom: 15px;">PASSENGER DETAILS</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 30px;" border="1" cellpadding="8" cellspacing="0">
                <tr style="background-color: #f8f9fa;">
                    <th>Ticket No</th>
                    <th>Route</th>
                    <th>Passenger Name</th>
                    <th>Age</th>
                    <th>Seat No</th>
                    <th>Fare (₹)</th>
                </tr>
                ${passengerRows}
            </table>

            <!-- Payment Details -->
            <h3 style="color: #2c3e50; margin-top: 30px; margin-bottom: 15px;">PAYMENT DETAILS</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 30px;" border="1" cellpadding="8" cellspacing="0">
                <tr style="background-color: #f8f9fa;"><td><strong>No. of Seats:</strong></td><td>${
                  apiInvoiceData.fareDetails?.NoOfSeats || 1
                }</td></tr>
                <tr><td><strong>Base Fare:</strong></td><td>₹ ${(
                  apiInvoiceData.fareDetails?.baseFare || 0
                ).toLocaleString()}</td></tr>
                <tr style="background-color: #f8f9fa;"><td><strong>Taxes:</strong></td><td>₹ ${(
                  apiInvoiceData.fareDetails?.taxes || 0
                ).toLocaleString()}</td></tr>
                <tr><td><strong>Service Charges:</strong></td><td>₹ ${(
                  apiInvoiceData.fareDetails?.serviceCharges || 0
                ).toLocaleString()}</td></tr>
                <tr style="background-color: #f8f9fa;"><td><strong>Platform Fee:</strong></td><td>₹ ${(
                  apiInvoiceData.vendorCommission || 0
                ).toLocaleString()}</td></tr>
                ${
                  (apiInvoiceData.fareDetails?.couponDiscount || 0) > 0
                    ? `<tr><td><strong>Coupon Discount (-):</strong></td><td>₹ ${apiInvoiceData.fareDetails.couponDiscount.toLocaleString()}</td></tr>`
                    : ""
                }
                <tr style="background-color: #f8f9fa;"><td><strong>IGST Rate:</strong></td><td>${
                  apiInvoiceData.fareDetails?.IGSTRate || 0
                }%</td></tr>
                <tr><td><strong>IGST Amount:</strong></td><td>₹ ${(
                  apiInvoiceData.fareDetails?.IGSTAmount || 0
                ).toLocaleString()}</td></tr>
                ${
                  apiInvoiceData.superCoinSavings > 0
                    ? `<tr style="background-color: #f8f9fa;"><td><strong>Super Coin Savings:</strong></td><td>₹ ${apiInvoiceData.superCoinSavings.toLocaleString()}</td></tr>`
                    : ""
                }
                <tr style="background-color: #e8f5e8; font-weight: bold;">
                    <td><strong>Total Payable:</strong></td>
                    <td><strong>₹ ${(
                      apiInvoiceData.totalPayable || 0
                    ).toLocaleString()}</strong></td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                    <td><strong>Amount in Words:</strong></td>
                    <td><strong>${
                      apiInvoiceData.invoiceTotalInWords || "N/A"
                    }</strong></td>
                </tr>
            </table>

            <!-- Boarding & Dropping Details -->
            <h3 style="color: #2c3e50; margin-top: 30px; margin-bottom: 15px;">BOARDING & DROPPING DETAILS</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 30px;" border="1" cellpadding="8" cellspacing="0">
                <tr>
                    <td style="vertical-align: top; width: 50%; background-color: #f8f9fa;">
                        <strong>Boarding Point:</strong><br>
                        <strong>Location:</strong> ${
                          apiInvoiceData.boardingPointdetails?.CityPointName ||
                          "N/A"
                        }<br>
                        <strong>Address:</strong> ${
                          apiInvoiceData.boardingPointdetails
                            ?.CityPointLocation || "N/A"
                        }<br>
                        <strong>Landmark:</strong> ${
                          apiInvoiceData.boardingPointdetails
                            ?.CityPointLandmark || "N/A"
                        }<br>
                        <strong>Time:</strong> ${formatTime(
                          apiInvoiceData.boardingPointdetails?.CityPointTime
                        )}<br>
                        <strong>Contact:</strong> ${
                          apiInvoiceData.boardingPointdetails
                            ?.CityPointContactNumber || "N/A"
                        }
                    </td>
                    <td style="vertical-align: top; width: 50%;">
                        <strong>Dropping Point:</strong><br>
                        <strong>Location:</strong> ${
                          apiInvoiceData.droppingPointdetails?.[0]
                            ?.CityPointName || "N/A"
                        }<br>
                        <strong>Address:</strong> ${
                          apiInvoiceData.droppingPointdetails?.[0]
                            ?.CityPointLocation || "N/A"
                        }<br>
                        <strong>Time:</strong> ${formatTime(
                          apiInvoiceData.droppingPointdetails?.[0]
                            ?.CityPointTime
                        )}
                    </td>
                </tr>
            </table>

            <!-- Passenger Contact Details (Only if available in API) -->
            ${
              apiInvoiceData.passenger?.[0]?.Email ||
              apiInvoiceData.passenger?.[0]?.Address ||
              apiInvoiceData.passenger?.[0]?.IdType
                ? `
            <h3 style="color: #2c3e50; margin-top: 30px; margin-bottom: 15px;">PASSENGER CONTACT DETAILS</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 30px;" border="1" cellpadding="8" cellspacing="0">
                ${
                  apiInvoiceData.passenger?.[0]?.Email
                    ? `<tr style="background-color: #f8f9fa;"><td><strong>Email:</strong></td><td>${apiInvoiceData.passenger[0].Email}</td></tr>`
                    : ""
                }
                ${
                  apiInvoiceData.passenger?.[0]?.Address
                    ? `<tr><td><strong>Address:</strong></td><td>${apiInvoiceData.passenger[0].Address}</td></tr>`
                    : ""
                }
                ${
                  apiInvoiceData.passenger?.[0]?.IdType &&
                  apiInvoiceData.passenger?.[0]?.IdNumber
                    ? `<tr style="background-color: #f8f9fa;"><td><strong>ID Type:</strong></td><td>${apiInvoiceData.passenger[0].IdType} - ${apiInvoiceData.passenger[0].IdNumber}</td></tr>`
                    : ""
                }
            </table>
            `
                : ""
            }

            <!-- Terms & Conditions -->
            <h3 style="color: #2c3e50; margin-top: 30px; margin-bottom: 15px;">TERMS & CONDITIONS</h3>
            <ul style="font-size: 14px; padding-left: 20px; margin-bottom: 30px;">
                <li>This is a computer-generated invoice; no signature required.</li>
                <li>All disputes are subject to jurisdiction of New Delhi.</li>
                <li>Please report at the boarding point at least 30 minutes before departure.</li>
                <li>Ensure correct contact number for updates on schedule or cancellation.</li>
                <li>Carry valid photo ID proof for verification during travel.</li>
                <li>Refunds and cancellations are subject to operator policies.</li>
                <li>The company will not be responsible for any delay due to traffic, weather conditions, or other unforeseen circumstances.</li>
                <li>Passengers are advised to reach the boarding point on time as bus will not wait.</li>
            </ul>

            ${
              apiInvoiceData.isFallback
                ? `
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin-top: 30px; border-radius: 5px;">
                <small style="color: #856404;">
                    <strong>Note:</strong> This invoice was generated with available booking data. 
                    For any discrepancies, please contact support with Booking ID: ${apiInvoiceData.bookingId}
                </small>
            </div>
            `
                : ""
            }

            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #3498db;">
                <small style="color: #7f8c8d;">Thank you for choosing RasuTrip! Have a safe journey!</small><br>
                <small style="color: #7f8c8d;">Generated on: ${new Date().toLocaleString(
                  "en-IN"
                )}</small><br>
                <small style="color: #7f8c8d;">Invoice ID: ${
                  apiInvoiceData.invoiceId ||
                  apiInvoiceData.invoiceNumber ||
                  "N/A"
                }</small>
            </div>
        </div>
    `;
  };

  // Keep the same handleDownloadInvoice function but remove E-ticket related code
  const handleDownloadInvoice = async () => {
    try {
      // Fetch invoice data if not already available
      if (!invoiceData && !loadingInvoice) {
        await fetchInvoiceData();
        return; // The data will be set, function will be called again by user
      }

      if (!invoiceData) {
        toast.error("Invoice data not available. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const htmlContent = generateBusInvoiceHTML(invoiceData);
      const bookingId =
        extractedBookingId ||
        bookingResult?.BookingId ||
        bookingResult?.bookingId ||
        "BUS";

      // Create a new window/tab for printing
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bus Invoice - ${
                  invoiceData.invoiceNumber ||
                  invoiceData.invoiceId ||
                  bookingId
                }</title>
                <meta charset="UTF-8">
                <style>
                    @media print {
                        body { margin: 0; }
                        @page { margin: 0.5in; }
                    }
                    @media screen {
                        body { 
                            background-color: #f5f5f5; 
                            padding: 20px; 
                        }
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
                <script>
                    window.onload = function() {
                        // Auto print after 1 second delay for better loading
                        setTimeout(() => {
                            window.print();
                        }, 1000);
                    }
                </script>
            </body>
            </html>
        `);
      printWindow.document.close();

      toast.success("Invoice opened for download/print!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Error generating invoice. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Auto-fetch invoice data on component mount
  useEffect(() => {
    // Automatically fetch invoice when booking is confirmed
    if (
      (extractedBookingId || bookingResult) &&
      !invoiceData &&
      !loadingInvoice
    ) {
      const timer = setTimeout(() => {
        fetchInvoiceData();
      }, 2000); // Delay to ensure booking is fully processed

      return () => clearTimeout(timer);
    }
  }, [extractedBookingId, bookingResult]);

  // Redirect if no booking data
  if (!state || (!extractedBookingId && !bookingResult)) {
    return (
      <Container className="py-5 mt-5">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}
        >
          <Card
            className="shadow border-0"
            style={{ borderRadius: "15px", maxWidth: "500px" }}
          >
            <Card.Body className="text-center p-5">
              <h4 className="text-danger mb-3">No Booking Information Found</h4>
              <p className="text-muted mb-4">
                It seems like there's no booking data available. Please start
                the booking process again.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="px-4 py-2"
                onClick={() => navigate("/")}
                style={{ borderRadius: "10px" }}
              >
                <FaHome className="me-2" />
                Back to Home
              </Button>
            </Card.Body>
          </Card>
        </div>
      </Container>
    );
  }

  const bookingId =
    extractedBookingId ||
    bookingResult?.BookingId ||
    bookingResult?.bookingId ||
    "N/A";
  const passengerName =
    bookingDetails?.contactData?.name ||
    `${bookingDetails?.passengerData?.[0]?.firstName || "Guest"} ${
      bookingDetails?.passengerData?.[0]?.lastName || "Name"
    }`;

  return (
    <div className="bg-light min-vh-100">
      <Container className="py-4">
        <div className="d-flex justify-content-center">
          <div style={{ maxWidth: "1200px", width: "100%" }}>
            {/* Success Header Card */}
            <Card
              className="text-center mb-5 border-0 shadow"
              style={{
                backgroundColor: "#28a745",
                borderRadius: "15px",
              }}
            >
              <Card.Body className="py-5 px-4">
                <h3 className="mb-3 fw-bold display-6 text-white">
                  Bus Booking Confirmed!
                </h3>
                <p className="mb-0 fs-5 text-white">
                  Your bus ticket has been successfully booked
                </p>
                <div className="mt-4">
                  <Badge
                    bg="light"
                    text="success"
                    className="fs-6 px-4 py-2 fw-semibold"
                  >
                    Booking ID: {bookingId}
                  </Badge>
                </div>
              </Card.Body>
            </Card>

            <Row className="g-4 mb-5">
              {/* Booking Details */}
              <Col lg={6}>
                <Card
                  className="h-100 border-0 shadow-sm"
                  style={{ borderRadius: "15px" }}
                >
                  <Card.Header
                    className="bg-primary text-white border-0 py-4"
                    style={{ borderRadius: "15px 15px 0 0" }}
                  >
                    <h4 className="mb-0 fw-bold">Journey Details</h4>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <div className="mb-4">
                      <div className="bg-success text-white p-4 rounded mb-4">
                        <small className="d-block mb-1">
                          Total Amount Paid
                        </small>
                        <h5 className="mb-0 fw-bold">
                          ₹{finalAmount?.toLocaleString()}
                        </h5>
                      </div>
                    </div>

                    {/* Show coupon savings if applicable */}
                    {couponDiscount > 0 && (
                      <div className="mb-4">
                        <div className="p-3 bg-success-subtle rounded border border-success">
                          <small className="text-success d-block mb-1">
                            Coupon Savings
                          </small>
                          <h6 className="mb-0 text-success fw-bold">
                            ₹{couponDiscount?.toLocaleString()} Saved!
                          </h6>
                          {appliedCouponData && (
                            <small className="text-muted">
                              Code:{" "}
                              {appliedCouponData.code ||
                                appliedCouponData.couponCode}
                            </small>
                          )}
                        </div>
                      </div>
                    )}

                    <Row className="g-3">
                      <Col sm={6}>
                        <div className="p-3 bg-light rounded">
                          <small className="text-muted d-block mb-1">
                            From
                          </small>
                          <span className="fw-semibold text-dark">
                            {bookingDetails?.fromCity || "Source"}
                          </span>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="p-3 bg-light rounded">
                          <small className="text-muted d-block mb-1">To</small>
                          <span className="fw-semibold text-dark">
                            {bookingDetails?.toCity || "Destination"}
                          </span>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="p-3 bg-light rounded">
                          <small className="text-muted d-block mb-1">
                            Departure
                          </small>
                          <span className="fw-semibold text-dark">
                            {bookingDetails?.bus?.departureTime
                              ? new Date(
                                  bookingDetails.bus.departureTime
                                ).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="p-3 bg-light rounded">
                          <small className="text-muted d-block mb-1">
                            No. of Seats
                          </small>
                          <span className="fw-semibold text-dark">
                            {bookingDetails?.selectedSeats?.length || 1}
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* Passenger Information */}
              <Col lg={6}>
                <Card
                  className="h-100 border-0 shadow-sm"
                  style={{ borderRadius: "15px" }}
                >
                  <Card.Header
                    className="bg-info text-white border-0 py-4"
                    style={{ borderRadius: "15px 15px 0 0" }}
                  >
                    <h4 className="mb-0 fw-bold">Passenger Information</h4>
                  </Card.Header>
                  <Card.Body className="p-4">
                    {bookingDetails?.passengerData?.length > 0 ? (
                      <div>
                        <div className="bg-warning text-white p-4 rounded mb-4">
                          <small className="d-block mb-1">
                            Primary Passenger
                          </small>
                          <h5 className="mb-0 fw-bold">{passengerName}</h5>
                        </div>

                        <Row className="g-3">
                          {bookingDetails.contactData?.email && (
                            <Col sm={12}>
                              <div className="p-3 bg-light rounded">
                                <small className="text-muted d-block mb-1">
                                  Email Address
                                </small>
                                <span className="fw-semibold text-dark">
                                  {bookingDetails.contactData.email}
                                </span>
                              </div>
                            </Col>
                          )}

                          {bookingDetails.contactData?.mobile && (
                            <Col sm={6}>
                              <div className="p-3 bg-light rounded">
                                <small className="text-muted d-block mb-1">
                                  Phone Number
                                </small>
                                <span className="fw-semibold text-dark">
                                  {bookingDetails.contactData.mobile}
                                </span>
                              </div>
                            </Col>
                          )}

                          <Col sm={6}>
                            <div className="p-3 bg-light rounded">
                              <small className="text-muted d-block mb-1">
                                Total Passengers
                              </small>
                              <span className="fw-semibold text-dark">
                                {bookingDetails.passengerData.length}
                              </span>
                            </div>
                          </Col>

                          {/* Show selected seats */}
                          {bookingDetails.selectedSeats && (
                            <Col sm={12}>
                              <div className="p-3 bg-light rounded">
                                <small className="text-muted d-block mb-1">
                                  Selected Seats
                                </small>
                                <div className="d-flex flex-wrap gap-2">
                                  {bookingDetails.selectedSeats.map(
                                    (seat, index) => (
                                      <Badge
                                        key={index}
                                        bg="primary"
                                        className="px-2 py-1"
                                      >
                                        {seat.SeatName ||
                                          seat.Name ||
                                          `Seat ${index + 1}`}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>
                            </Col>
                          )}
                        </Row>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <p className="text-muted mb-0">
                          Passenger information not available
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Invoice Status */}
            {loadingInvoice && (
              <Card
                className="border-0 shadow-sm mb-4"
                style={{ borderRadius: "15px" }}
              >
                <Card.Body className="p-4 text-center">
                  <Spinner
                    animation="border"
                    variant="primary"
                    className="me-2"
                  />
                  <span>Loading invoice data...</span>
                </Card.Body>
              </Card>
            )}

            {invoiceError && !invoiceData && (
              <Card
                className="border-0 shadow-sm mb-4"
                style={{ borderRadius: "15px" }}
              >
                <Card.Body className="p-4">
                  <Alert variant="warning" className="mb-0">
                    <strong>Invoice Note:</strong> {invoiceError}. A basic
                    invoice will be generated with available booking data.
                  </Alert>
                </Card.Body>
              </Card>
            )}

            {/* Action Buttons */}
            <Card
              className="border-0 shadow-sm"
              style={{ borderRadius: "15px" }}
            >
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h5 className="mb-4 text-dark fw-bold">
                    What would you like to do next?
                  </h5>

                  <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
                    <Button
                      variant="success"
                      size="lg"
                      className="px-5 py-3 fw-semibold"
                      onClick={() => handleDownload("invoice", bookingId)}
                      disabled={loadingInvoice}
                      style={{
                        fontSize: "1.1rem",
                        borderRadius: "10px",
                        minWidth: "200px",
                      }}
                    >
                      {loadingInvoice ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Loading Invoice...
                        </>
                      ) : (
                        <>
                          <FaDownload className="me-2" />
                          Download Invoice
                        </>
                      )}
                    </Button>

                    <Button
                      variant="warning"
                      size="lg"
                      className="px-5 py-3 fw-semibold"
                      onClick={() => handleDownload("ticket", bookingId)}
                      disabled={loadingInvoice}
                      style={{
                        fontSize: "1.1rem",
                        borderRadius: "10px",
                        minWidth: "200px",
                      }}
                    >
                      {loadingInvoice ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Loading E-Ticket...
                        </>
                      ) : (
                        <>
                          <FaDownload className="me-2" />
                          Download E-Ticket
                        </>
                      )}
                    </Button>

                    <Button
                      variant="primary"
                      size="lg"
                      className="px-5 py-3 fw-semibold"
                      onClick={() => navigate("/")}
                      style={{
                        fontSize: "1.1rem",
                        borderRadius: "10px",
                        minWidth: "200px",
                      }}
                    >
                      <FaHome className="me-2" />
                      Back to Home
                    </Button>
                  </div>

                  {/* Show invoice data status */}
                  {invoiceData && (
                    <div className="mt-4">
                      <Alert
                        variant="success"
                        className="border-0"
                        style={{
                          backgroundColor: "#d4edda",
                          borderRadius: "10px",
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-center">
                          <FaCheckCircle className="me-2 text-success" />
                          <span className="text-success fw-semibold">
                            Invoice data loaded successfully
                            {invoiceData.invoiceId &&
                              ` (${invoiceData.invoiceId})`}
                          </span>
                        </div>
                      </Alert>
                    </div>
                  )}
                </div>

                <div className="border-top pt-4">
                  <Alert
                    variant="success"
                    className="border-0 mb-3"
                    style={{
                      backgroundColor: "#d4edda",
                      borderRadius: "10px",
                    }}
                  >
                    <div className="d-flex align-items-start">
                      <div className="flex-grow-1">
                        <Alert.Heading
                          as="h6"
                          className="text-success mb-2 fw-bold"
                        >
                          Bus Booking Completed Successfully
                        </Alert.Heading>
                        <p className="mb-2 text-dark">
                          Your bus booking has been confirmed successfully.
                          {invoiceData
                            ? " Your detailed invoice and e-ticket are ready for download."
                            : " An invoice and e-ticket will be generated with your booking details."}
                          Please keep your booking ID for future reference.
                        </p>
                        <small className="text-muted">
                          For any assistance, please contact our support team
                          with this booking ID: <strong>{bookingId}</strong>
                        </small>
                      </div>
                    </div>
                  </Alert>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default BookingConfirm;