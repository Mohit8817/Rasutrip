import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../Context/AuthContext";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";

import {
  fetchUpcomingBookings,
  fetchAllBookings,
  fetchAllBookingsComplete,
  getUserType,
  isUserAuthenticated,
  fetchRealTimeStatus,
  fetchMultipleRealTimeStatus,
  busInvoiceServices,
} from "../../services/bookingApi";

const BusBookingHistory = () => {
  const { user } = useContext(AuthContext);
  const [bookingType, setBookingType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [userType, setUserType] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // API Pagination states - track pagination from API response
  const [upcomingPagination, setUpcomingPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [allPagination, setAllPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Client-side pagination states - for displaying the current data
  const [currentPageUpcoming, setCurrentPageUpcoming] = useState(1);
  const [currentPageAll, setCurrentPageAll] = useState(1);
  const itemsPerPage = 10;

  // Real-time status states
  const [realTimeStatuses, setRealTimeStatuses] = useState({});
  const [loadingStatuses, setLoadingStatuses] = useState(new Set());

  // Status popup states
  const [statusPopup, setStatusPopup] = useState({
    isOpen: false,
    booking: null,
    loading: false,
    data: null,
    error: null,
  });

  // Get current pagination info based on active tab
  const getCurrentPagination = () => {
    return bookingType === "upcoming" ? upcomingPagination : allPagination;
  };

  // Get current page based on active tab
  const getCurrentPage = () => {
    return bookingType === "upcoming" ? currentPageUpcoming : currentPageAll;
  };

  // Set current page based on active tab
  const setCurrentPage = (page) => {
    if (bookingType === "upcoming") {
      setCurrentPageUpcoming(page);
    } else {
      setCurrentPageAll(page);
    }
  };

  // Get current bookings based on active tab
  const getCurrentBookings = () => {
    return bookingType === "upcoming" ? upcomingBookings : allBookings;
  };

  // Get paginated bookings for display
  const getPaginatedBookings = () => {
    const bookings = getCurrentBookings();
    const currentPage = getCurrentPage();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    console.log("Current bookings for display:", bookings.length);

    return {
      paginatedBookings: bookings.slice(startIndex, endIndex),
      totalPages: Math.ceil(bookings.length / itemsPerPage),
      totalItems: bookings.length,
      currentPage: currentPage,
    };
  };

  // Handle tab change
  const handleTabChange = (newBookingType) => {
    setBookingType(newBookingType);
    // Reset to first page when switching tabs
    if (newBookingType === "upcoming") {
      setCurrentPageUpcoming(1);
    } else {
      setCurrentPageAll(1);
    }
  };

  // Handle pagination change - this will trigger new API calls
  const handleApiPaginationChange = (page) => {
    if (bookingType === "upcoming") {
      setUpcomingPagination((prev) => ({ ...prev, page }));
      loadUpcomingBookings(page);
    } else {
      setAllPagination((prev) => ({ ...prev, page }));
      loadAllBookings(page);
    }
  };

  // Load all bookings from all pages (for complete data)
  const loadAllBookingsComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      const detectedUserType = getUserType();
      setUserType(detectedUserType);

      if (!detectedUserType || !isUserAuthenticated(detectedUserType)) {
        throw new Error(
          `Please login as ${
            detectedUserType || "user"
          } to view booking history.`
        );
      }

      console.log(
        "Loading complete bus bookings for user type:",
        detectedUserType
      );

      // Fetch all bookings from all pages
      const allResponse = await fetchAllBookingsComplete(detectedUserType, 50); // Higher limit per page

      if (allResponse.success) {
        const formattedBookings = formatBookingData(allResponse.data, false);
        setAllBookings(formattedBookings);
        setAllPagination({
          page: 1,
          limit: formattedBookings.length,
          total: allResponse.pagination.total,
          totalPages: 1, // Since we have all data
        });
        console.log(
          `All ${formattedBookings.length} bookings loaded successfully`
        );
      } else {
        throw new Error(allResponse.message);
      }

      // Also load upcoming bookings
      await loadUpcomingBookings(1);
    } catch (error) {
      console.error("Error loading complete bookings:", error);
      setError(
        error.message || "Failed to load booking history. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load upcoming bookings with API pagination
  const loadUpcomingBookings = async (page = 1) => {
    try {
      const detectedUserType = getUserType();
      console.log("Loading upcoming bookings - Page:", page);

      const upcomingResponse = await fetchUpcomingBookings(
        detectedUserType,
        page,
        10
      );

      if (upcomingResponse.success) {
        const formattedBookings = formatBookingData(
          upcomingResponse.data,
          true
        );

        if (page === 1) {
          // Replace data for first page
          setUpcomingBookings(formattedBookings);
        } else {
          // Append data for subsequent pages
          setUpcomingBookings((prev) => [...prev, ...formattedBookings]);
        }

        setUpcomingPagination(upcomingResponse.pagination);
        console.log(
          `Upcoming bookings loaded - Page ${page}:`,
          formattedBookings.length
        );
      }
    } catch (error) {
      console.warn("Failed to fetch upcoming bookings:", error.message);
    }
  };

  // Load all bookings with API pagination
  const loadAllBookings = async (page = 1) => {
    try {
      const detectedUserType = getUserType();
      console.log("Loading all bookings - Page:", page);

      const allResponse = await fetchAllBookings(detectedUserType, page, 10);

      if (allResponse.success) {
        const formattedBookings = formatBookingData(allResponse.data, false);

        if (page === 1) {
          // Replace data for first page
          setAllBookings(formattedBookings);
        } else {
          // Append data for subsequent pages
          setAllBookings((prev) => [...prev, ...formattedBookings]);
        }

        setAllPagination(allResponse.pagination);
        console.log(
          `All bookings loaded - Page ${page}:`,
          formattedBookings.length
        );
      }
    } catch (error) {
      console.warn("Failed to fetch all bookings:", error.message);
    }
  };

  //   SDV

  //   SV
  //   XV
  //   XSC
  // VSC

  // E-Ticket Download Function - NEW
  const handleETicketDownload = (booking) => {
    try {
      // Generate E-Ticket data (similar to invoice but different structure)
      const eTicketData = generateETicketData(booking);
      const htmlContent = generateETicketHTML(eTicketData);

      // Create a new window/tab for printing/download
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>E-Ticket - ${eTicketData.ticketNumber}</title>
          <style>
            @media print {
              body { margin: 0; }
              @page { margin: 0.5in; }
            }
            body { font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 500);
            }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();

      // Also trigger email send functionality using same API
      busInvoiceServices({
        bookingId: booking.rawData.bookingId,
        userIp: booking.rawData.UserIp,
        searchTokenId: booking.rawData.SearchTokenId,
        receiverEmail: booking.rawData.Result?.Passenger?.[0]?.Email,
      });

      toast.success(
        `E-Ticket download opened & email sent! Booking ID: ${booking.bookingId}`,
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
    } catch (error) {
      console.error("Error processing e-ticket:", error);
      toast.error("Error processing e-ticket. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Generate E-Ticket Data from Booking - NEW
  const generateETicketData = (booking) => {
    const now = new Date();
    const ticketNumber = `TICKET-${booking.bookingId}`;

    // Parse passenger data from raw booking data
    let passengerArray = [];
    if (
      booking.rawData?.Result?.Passenger &&
      Array.isArray(booking.rawData.Result.Passenger)
    ) {
      passengerArray = booking.rawData.Result.Passenger;
    } else if (booking.passengerName && booking.passengerName !== "N/A") {
      passengerArray = [
        {
          FirstName: booking.passengerName.split(" ")[0] || "Passenger",
          LastName: booking.passengerName.split(" ").slice(1).join(" ") || "",
          Age: 25,
          Gender: "N/A",
          SeatName: booking.seatNumber,
        },
      ];
    }

    return {
      // Basic Ticket Info
      ticketNumber: ticketNumber,
      ticketDate: now.toLocaleDateString("en-IN"),
      bookingId: booking.bookingId,
      pnr: booking.pnr || booking.ticketNo || booking.bookingId,

      // Company Details
      operatorDetails: {
        name: "RasuTrip",
        mobile: "+91-9266424809",
        email: "rasutrip@gmail.com",
        website: "www.rasutrip.com",
      },

      // Passenger Details
      passengerDetails: {
        name: booking.passengerName || "N/A",
        phone: booking.contactNumber || "N/A",
        email:
          booking.rawData?.Result?.Passenger?.[0]?.Email ||
          "customer@email.com",
      },

      // Journey Details
      journeyDetails: {
        from: booking.from,
        to: booking.to,
        departureDate: booking.travelDate
          ? new Date(booking.travelDate).toLocaleDateString("en-IN")
          : now.toLocaleDateString("en-IN"),
        departureTime: booking.travelDate
          ? new Date(booking.travelDate).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "09:00 AM",
        busType: booking.busType,
        seatNumbers: booking.seatNumber,
        totalAmount: booking.totalAmount,
      },

      // Passenger List for E-Ticket
      passengers:
        passengerArray.length > 0
          ? passengerArray.map((p, index) => ({
              serialNo: index + 1,
              name: `${p.Title || "Mr"} ${p.FirstName || "Passenger"} ${
                p.LastName || ""
              }`.trim(),
              age: p.Age || 25,
              gender: p.Gender || "N/A",
              seatNo:
                p.SeatName ||
                booking.seatNumber.split(",")[index] ||
                booking.seatNumber,
              fare: Math.round(
                parseFloat(booking.totalAmount) /
                  Math.max(passengerArray.length, 1)
              ),
            }))
          : [
              {
                serialNo: 1,
                name: booking.passengerName || "Passenger",
                age: 25,
                gender: "N/A",
                seatNo: booking.seatNumber,
                fare: parseFloat(booking.totalAmount) || 0,
              },
            ],

      // Boarding/Dropping Points
      boardingPoint: {
        name: `${booking.from} `,
        address: `${booking.from} Bus Station, Main Road`,
        landmark: "Near City Center",
        reportingTime: booking.travelDate
          ? new Date(
              new Date(booking.travelDate).getTime() - 30 * 60 * 1000
            ).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "08:30 AM",
        contactNumber: "+91-9876543210",
      },

      droppingPoint: {
        name: `${booking.to} `,
        address: `${booking.to} Bus Terminal, Central Location`,
        landmark: "Near Railway Station",
        estimatedArrival: booking.travelDate
          ? new Date(
              new Date(booking.travelDate).getTime() + 8 * 60 * 60 * 1000
            ).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "05:00 PM",
      },

      // Booking Status
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus || "Completed",
    };
  };

  // Generate E-Ticket HTML - NEW
  const generateETicketHTML = (ticketData) => {
    let passengerRows = "";
    ticketData.passengers.forEach((passenger) => {
      passengerRows += `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 8px; text-align: center;">${passenger.serialNo}</td>
          <td style="padding: 8px;">${passenger.name}</td>
          <td style="padding: 8px; text-align: center;">${passenger.age}</td>
          <td style="padding: 8px; text-align: center;">${passenger.gender}</td>
          <td style="padding: 8px; text-align: center; font-weight: bold; color: #d32f2f;">${passenger.seatNo}</td>
        </tr>
      `;
    });

    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 20px auto;  overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header Section -->
        <div style="background: #d32f2f; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Trip Details</h1>
          <br>
           <h1 style="margin: 0; font-size: 22px; font-weight: bold;">${ticketData.journeyDetails.from} to ${ticketData.journeyDetails.to}</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;"></p>
        </div>



        <!-- Ticket Info Bar -->
        <div style="background: #d32f2f; padding: 15px; border-bottom: 2px solid #d32f2f;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div>
              <span style="color: white; font-size: 18px;">PNR No: ${ticketData.pnr}</span>
            </div>
            <div style="text-align: right;">
              <span style="color: white; font-size: 18px;">Date: ${ticketData.ticketDate}</span>
            </div>
          </div>
        </div>

          <div>
        <p>
        Hey  ${ticketData.passengerDetails.name},<br>
         </p>
         <p class="style="font-size:34px; color: #333; line-height: 1.6;">
         Thank you once again for booking your bus ticket with RasuTrip. This mail will help you with all the information related to your upcoming trip from ${ticketData.journeyDetails.from} to ${ticketData.journeyDetails.to}.
         </p>

        </div>

        

        <!-- Journey Details -->
        <div style="padding: 20px; background: white; ">
          <h2 style="color: black; padding-bottom: 10px; margin-bottom: 20px; background: white;"> JOURNEY DETAILS</h2>
          
          <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; align-items: center; margin-bottom: 20px;">
            <div style="text-align: center; padding: 15px; background: #fafafaff; border-radius: 8px;">
              <h3 style="margin: 0; color: #7d7c7cff; font-size: 12px;">Departure Date and TIME</h3>
              <p style="margin: 0; color: black; font-weight: bold;">${ticketData.journeyDetails.departureDate}</p>
              <p style="margin: 0; color: black; font-weight: bold; font-size: 16px;">${ticketData.journeyDetails.departureTime}</p>
            </div>
            
            <div style="text-align: center;">
              <div style="width: 50px; height: 3px; background: linear-gradient(to right, #4caf50, #2196f3); margin: 0 auto; position: relative;">
                <div style="position: absolute; right: -5px; top: -8px; width: 0; height: 0; border-left: 10px solid #2196f3; border-top: 7px solid transparent; border-bottom: 7px solid transparent;"></div>
              </div>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">ROUTE</p>
            </div>
            
            <div style="text-align: center; padding: 15px; background: #fafafaff; border-radius: 8px;">
              <h3 style="margin: 0; color: #7d7c7cff; font-size: 12px;">Arrival Date and TIME</h3>
              <p style="margin: 0; color: black; font-weight: bold;">${ticketData.journeyDetails.departureDate}</p>
              <p style="margin: 0; color: black; font-weight: bold; font-size: 16px;">${ticketData.droppingPoint.estimatedArrival}</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; ">
              <strong style="color: black;">Bus Type:</strong><br>
              <span style="font-size: 16px; color: #333;">${ticketData.journeyDetails.busType}</span>
            </div>
           
         
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; ">
              <strong style="color: black;">Status:</strong><br>
              <span style="font-size: 16px; font-weight: bold; color: #2e7d32;">${ticketData.bookingStatus}</span>
            </div>
          </div>
        </div>
                <!-- Contact & Boarding Info -->
        <div style="padding: 20px; background: #fff;">
          <h2 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px; margin-bottom: 20px;"> </h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="background: white; padding: 15px; border-radius: 8px;">
              <h3 style="color: #7d7c7cff; margin: 0 0 10px 0; font-size:12px"> BOARDING POINT</h3>
              <p style="margin: 5px 0; font-weight: bold;">${ticketData.boardingPoint.name}</p>
              <p style="margin: 5px 0; color: #666;">${ticketData.boardingPoint.address}</p>
              <p style="margin: 5px 0; color: #666;">Landmark: ${ticketData.boardingPoint.landmark}</p>
              <p style="margin: 5px 0; color: #2e7d32;"> ${ticketData.boardingPoint.contactNumber}</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 8px;">
              <h3 style="color: #7d7c7cff; margin: 0 0 10px 0; font-size:12px"> DROPPING POINT</h3>
              <p style="margin: 5px 0; font-weight: bold;">${ticketData.droppingPoint.name}</p>
              <p style="margin: 5px 0; color: #666;">${ticketData.droppingPoint.address}</p>
              <p style="margin: 5px 0; color: #666;">Landmark: ${ticketData.droppingPoint.landmark}</p>
            </div>
          </div>


        <!-- Passenger Details -->
        <div style="padding: 20px; background: #fafafa;">
          <h2 style="color: #black; border-bottom: 2px solid #d32f2f; padding-bottom: 10px; margin-bottom: 20px;"> PASSENGER DETAILS</h2>
          
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <thead style="background: #d32f2f; color: white;">
              <tr>
                <th style="padding: 12px; text-align: center;">S.No</th>
                <th style="padding: 12px; text-align: left;">Passenger Name</th>
                <th style="padding: 12px; text-align: center;">Age</th>
                <th style="padding: 12px; text-align: center;">Gender</th>
                <th style="padding: 12px; text-align: center;">Seat No.</th>
              </tr>
            </thead>
            <tbody>
              ${passengerRows}
            </tbody>
          </table>
        </div>

       

        

        <!-- Important Instructions -->
        <div style="padding: 20px; background: #fff3e0; border-top: 3px solid #ff9800;">
          <h2 style="color: #ef6c00; margin: 0 0 15px 0;"> IMPORTANT INSTRUCTIONS</h2>
          <ul style="color: #333; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li><strong>Report 30 minutes before departure</strong> at the boarding point</li>
            <li>Carry a valid <strong>government-issued photo ID</strong> (Aadhaar/PAN/Driving License)</li>
            <li>This e-ticket must be presented either in <strong>printed form or on mobile</strong></li>
            <li>Smoking and consumption of alcohol are <strong>strictly prohibited</strong> during the journey</li>
            <li>Keep your mobile phone charged for emergency contact</li>
            <li>Bus timings may vary due to traffic and weather conditions</li>
            <li>For cancellation and refund queries, contact customer support</li>
          </ul>
        </div>

        <!-- Footer -->
        <div style="background: #d32f2f; color: white; padding: 15px; text-align: center;">
          <div style="margin-bottom: 10px;">
            <strong>${ticketData.operatorDetails.name}</strong><br>
             ${ticketData.operatorDetails.mobile} |  ${ticketData.operatorDetails.email}<br>
             ${ticketData.operatorDetails.website}
          </div>
         
        </div>
      </div>
    `;
  };

  //   CV
  //   SDV
  //   VSDC
  //   VSC

  // Combined Invoice Function - Download and Send Email
  const handleInvoice = (booking) => {
    try {
      // First, generate and download invoice
      const invoiceData = generateInvoiceData(booking);
      const htmlContent = generateInvoiceHTML(invoiceData);

      // Create a new window/tab for printing/download
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoice - ${invoiceData.invoiceNumber}</title>
                    <style>
                        @media print {
                            body { margin: 0; }
                            @page { margin: 0.5in; }
                        }
                        body { font-family: Arial, sans-serif; }
                    </style>
                </head>
                <body>
                    ${htmlContent}
                    <script>
                        window.onload = function() {
                            setTimeout(() => {
                                window.print();
                            }, 500);
                        }
                    </script>
                </body>
                </html>
            `);
      printWindow.document.close();

      // Also trigger email send functionality
      busInvoiceServices({
        bookingId: booking.rawData.bookingId,
        userIp: booking.rawData.UserIp,
        searchTokenId: booking.rawData.SearchTokenId,
        receiverEmail: booking.rawData.Result?.Passenger?.[0]?.Email,
      });

      toast.success(
        `Invoice download opened & email sent! Booking ID: ${booking.bookingId}`,
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
    } catch (error) {
      console.error("Error processing invoice:", error);
      toast.error("Error processing invoice. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Generate Invoice Data from Booking
  const generateInvoiceData = (booking) => {
    const now = new Date();
    const invoiceNumber = `INV-BUS-${booking.bookingId}`;

    // Parse passenger data from raw booking data
    let passengerArray = [];
    if (
      booking.rawData?.Result?.Passenger &&
      Array.isArray(booking.rawData.Result.Passenger)
    ) {
      passengerArray = booking.rawData.Result.Passenger;
    } else if (booking.passengerName && booking.passengerName !== "N/A") {
      // Create a single passenger object if we don't have detailed passenger data
      passengerArray = [
        {
          FirstName: booking.passengerName.split(" ")[0] || "Passenger",
          LastName: booking.passengerName.split(" ").slice(1).join(" ") || "",
          Age: 25,
          Gender: "N/A",
          SeatName: booking.seatNumber,
        },
      ];
    }

    // Calculate fare breakdown
    const totalAmount = parseFloat(booking.totalAmount) || 0;
    const baseFare = Math.round(totalAmount * 0.85);
    const taxes = Math.round(totalAmount * 0.12);
    const serviceCharges = Math.round(totalAmount * 0.03);
    const vendorCommission = Math.round(totalAmount * 0.02);

    return {
      // Basic Invoice Info
      invoiceId: invoiceNumber,
      invoiceNumber: invoiceNumber,
      invoiceDate: now.toLocaleDateString("en-IN"),
      bookingId: booking.bookingId,

      // Company Details (Supplier)
      supplierDetails: {
        name: "RasuTrip Pvt. Ltd.",
        mobile: "+91-9876543210",
        email: "support@rasutrip.com",
        pan: "ABCDE1234F",
        state: "Delhi",
        companyRegisteredNumber: "U63040DL2020PTC123456",
      },

      // Customer Details
      receiverDetails: {
        name: booking.passengerName || "N/A",
        phone: booking.contactNumber || "N/A",
        email: "customer@email.com",
      },

      // Journey Details
      source: booking.from,
      destination: booking.to,
      departureTime: booking.travelDate
        ? new Date(booking.travelDate).toISOString()
        : now.toISOString(),
      arrivalTime: booking.travelDate
        ? new Date(
            new Date(booking.travelDate).getTime() + 8 * 60 * 60 * 1000
          ).toISOString()
        : now.toISOString(),
      busType: booking.busType,
      TicketNo: booking.ticketNo || booking.bookingId,

      // Passenger Details
      passenger:
        passengerArray.length > 0
          ? passengerArray.map((p, index) => ({
              Title: p.Title || "Mr",
              FirstName: p.FirstName || "Passenger",
              LastName: p.LastName || `${index + 1}`,
              Age: p.Age || 25,
              Gender: p.Gender || "N/A",
              SeatName:
                p.SeatName ||
                booking.seatNumber.split(",")[index] ||
                booking.seatNumber,
              Seat: {
                SeatFare: Math.round(
                  totalAmount / Math.max(passengerArray.length, 1)
                ),
              },
            }))
          : [
              {
                Title: "Mr",
                FirstName: booking.passengerName?.split(" ")[0] || "Passenger",
                LastName:
                  booking.passengerName?.split(" ").slice(1).join(" ") || "",
                Age: 25,
                Gender: "N/A",
                SeatName: booking.seatNumber,
                Seat: {
                  SeatFare: totalAmount,
                },
              },
            ],

      // Fare Details
      fareDetails: {
        NoOfSeats: booking.seatNumber
          ? booking.seatNumber.split(",").length
          : 1,
        baseFare: baseFare,
        taxes: taxes,
        serviceCharges: serviceCharges,
        couponDiscount: 0,
        IGSTRate: 12,
      },

      // Boarding/Dropping Points (default values as we don't have this data in history)
      boardingPointdetails: {
        CityPointName: `${booking.from} Boarding Point`,
        CityPointLocation: booking.from,
        CityPointLandmark: "Main Bus Stand",
        CityPointTime: booking.travelDate
          ? new Date(booking.travelDate).toISOString()
          : now.toISOString(),
        CityPointContactNumber: "+91-9876543210",
      },

      droppingPointdetails: [
        {
          CityPointName: `${booking.to} Dropping Point`,
          CityPointLocation: booking.to,
          CityPointTime: booking.travelDate
            ? new Date(
                new Date(booking.travelDate).getTime() + 8 * 60 * 60 * 1000
              ).toISOString()
            : now.toISOString(),
        },
      ],

      // Payment
      vendorCommission: vendorCommission,
      totalPayable: totalAmount,
      invoiceTotal: totalAmount,
    };
  };

  // Generate HTML Invoice (same as booking confirmation)
  const generateInvoiceHTML = (invoiceData) => {
    let busPassengerRows = "";
    invoiceData.passenger.forEach((p, i) => {
      busPassengerRows += `
              <tr>
                <td>${invoiceData.TicketNo}</td>
                <td>${invoiceData.source} - ${invoiceData.destination}</td>
                <td>${p.Title} ${p.FirstName} ${p.LastName}</td>
                <td>${p.Age}</td>
                <td>${p.SeatName}</td>
                <td>₹ ${p.Seat.SeatFare}</td>
              </tr>
            `;
    });

    return `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ccc; padding: 20px;">
              <h2 style="text-align: center;">Tax Invoice (Bus Booking)</h2>

              <table style="width: 100%; margin-bottom: 20px; font-size: 14px;">
                <tr>
                  <td>
                    <strong>From :</strong> ${
                      invoiceData.supplierDetails.name
                    }<br />
                    <strong>Mobile :</strong> ${
                      invoiceData.supplierDetails.mobile
                    }<br />
                    <strong>Email :</strong> ${
                      invoiceData.supplierDetails.email
                    }<br />
                    <strong>PAN Number :</strong> ${
                      invoiceData.supplierDetails.pan
                    }<br />
                    <strong>State :</strong> ${
                      invoiceData.supplierDetails.state
                    }<br />
                    <strong>Company Registered No. :</strong> ${
                      invoiceData.supplierDetails.companyRegisteredNumber
                    }
                  </td>
                  <td style="text-align: right;">
                    <strong>Passenger Name :</strong> ${
                      invoiceData.receiverDetails.name
                    }<br />
                    <strong>Phone :</strong> ${
                      invoiceData.receiverDetails.phone
                    }
                  </td>
                </tr>
              </table>

              <table style="width: 100%; font-size: 14px; margin-bottom: 20px;" border="1" cellpadding="8" cellspacing="0">
                <tr>
                  <td><strong>Invoice Number :</strong> ${
                    invoiceData.invoiceId
                  }</td>
                  <td><strong>Invoice Date :</strong> ${
                    invoiceData.invoiceDate
                  }</td>
                </tr>
                <tr>
                  <td><strong>Booking ID :</strong> ${
                    invoiceData.bookingId
                  }</td>
                  <td><strong>Ticket No :</strong> ${invoiceData.TicketNo}</td>
                </tr>
                <tr>
                  <td><strong>From :</strong> ${invoiceData.source}</td>
                  <td><strong>To :</strong> ${invoiceData.destination}</td>
                </tr>
                <tr>
                  <td><strong>Departure :</strong> ${new Date(
                    invoiceData.departureTime
                  ).toLocaleString()}</td>
                  <td><strong>Arrival :</strong> ${new Date(
                    invoiceData.arrivalTime
                  ).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colspan="2"><strong>Bus Type :</strong> ${
                    invoiceData.busType
                  }</td>
                </tr>
              </table>

              <h3>PASSENGER DETAILS</h3>
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;" border="1" cellpadding="8" cellspacing="0">
                <tr>
                  <th>Ticket No</th>
                  <th>Route</th>
                  <th>Passenger Name</th>
                  <th>Age</th>
                  <th>Seat No</th>
                  <th>Fare (₹)</th>
                </tr>
                ${busPassengerRows}
              </table>

              <h3 style="margin-top: 30px;">PAYMENT DETAILS</h3>
              <table style="width: 100%; font-size: 14px;" cellpadding="8" cellspacing="0">
                <tr><td><strong>No. of Seats:</strong></td><td>${
                  invoiceData.fareDetails.NoOfSeats
                }</td></tr>
                <tr><td><strong>Base Fare:</strong></td><td>₹ ${
                  invoiceData.fareDetails.baseFare
                }</td></tr>
                <tr><td><strong>Taxes:</strong></td><td>₹ ${
                  invoiceData.fareDetails.taxes
                }</td></tr>
                <tr><td><strong>Service Charges:</strong></td><td>₹ ${
                  invoiceData.fareDetails.serviceCharges
                }</td></tr>
                <tr><td><strong>Platform Fee:</strong></td><td>₹ ${
                  invoiceData.vendorCommission
                }</td></tr>
                <tr><td><strong>Coupon Discount (-):</strong></td><td>₹ ${
                  invoiceData.fareDetails.couponDiscount
                }</td></tr>
                <tr><td><strong>IGST Rate:</strong></td><td>${
                  invoiceData.fareDetails.IGSTRate
                }%</td></tr>
                <tr><td><strong>Total Payable:</strong></td><td><strong>₹ ${
                  invoiceData.totalPayable
                }</strong></td></tr>
              </table>

              <h3 style="margin-top: 30px;">BOARDING & DROPPING DETAILS</h3>
              <table style="width: 100%; font-size: 14px;" cellpadding="8" cellspacing="0">
                <tr>
                  <td><strong>Boarding:</strong><br>
                    ${invoiceData.boardingPointdetails.CityPointName}, ${
      invoiceData.boardingPointdetails.CityPointLocation
    }<br>
                    Landmark: ${
                      invoiceData.boardingPointdetails.CityPointLandmark
                    }<br>
                    Time: ${new Date(
                      invoiceData.boardingPointdetails.CityPointTime
                    ).toLocaleString()}<br>
                    Contact: ${
                      invoiceData.boardingPointdetails.CityPointContactNumber
                    }
                  </td>
                  <td><strong>Dropping:</strong><br>
                    ${invoiceData.droppingPointdetails[0].CityPointName}, ${
      invoiceData.droppingPointdetails[0].CityPointLocation
    }<br>
                    Time: ${new Date(
                      invoiceData.droppingPointdetails[0].CityPointTime
                    ).toLocaleString()}
                  </td>
                </tr>
              </table>

              <h3 style="margin-top: 30px;">TERMS & CONDITIONS</h3>
              <ul style="font-size: 14px; padding-left: 20px;">
                <li>This is a computer-generated invoice; no signature required.</li>
                <li>All disputes are subject to jurisdiction of New Delhi.</li>
                <li>Please report at the boarding point at least 30 minutes before departure.</li>
                <li>Ensure correct contact number for updates on schedule or cancellation.</li>
              </ul>
            </div>
        `;
  };

  const handleInvoiceSend = (
    bookingIdForInvoice,
    UserIpForInvoice,
    SearchTokenIdForInvoice,
    passengerEmailForInvoice
  ) => {
    busInvoiceServices({
      bookingId: bookingIdForInvoice,
      userIp: UserIpForInvoice,
      searchTokenId: SearchTokenIdForInvoice,
      receiverEmail: passengerEmailForInvoice,
    });
    alert(`Invoice download initiated for booking: ${bookingIdForInvoice}`);
  };

  // Function to fetch detailed booking status for popup
  const fetchDetailedBookingStatus = async (booking) => {
    setStatusPopup((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchRealTimeStatus(booking, userType);

      const detailedData = {
        bookingInfo: {
          bookingId: booking.bookingId,
          pnr: booking.pnr,
          ticketNo: booking.ticketNo,
          route: `${booking.from} → ${booking.to}`,
          travelDate: booking.travelDate,
          busType: booking.busType,
          seatNumber: booking.seatNumber,
          passengerName: booking.passengerName,
          contactNumber: booking.contactNumber,
          totalAmount: booking.totalAmount,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
          bookingDate: booking.bookingDate,
        },
        realTimeStatus: result.success
          ? {
              currentStatus: result.status,
              lastUpdated: result.lastUpdated || new Date(),
              busLocation: result.location || "Not available",
              estimatedArrival: result.estimatedArrival || "Not available",
              delay: result.delay || "On time",
              nextStop: result.nextStop || "Not available",
            }
          : null,
        error: result.success ? null : result.error,
      };

      setStatusPopup((prev) => ({
        ...prev,
        data: detailedData,
        loading: false,
      }));

      if (result.success) {
        toast.success("Status details updated!");
      } else {
        toast.warn("Some status information may not be available");
      }
    } catch (error) {
      console.error("Error fetching detailed status:", error);
      setStatusPopup((prev) => ({
        ...prev,
        error: error.message || "Failed to fetch detailed status",
        loading: false,
      }));
      toast.error("Failed to fetch detailed status");
    }
  };

  // Open status popup
  const openStatusPopup = (booking) => {
    setStatusPopup({
      isOpen: true,
      booking: booking,
      loading: false,
      data: null,
      error: null,
    });
    fetchDetailedBookingStatus(booking);
  };

  // Close status popup
  const closeStatusPopup = () => {
    setStatusPopup({
      isOpen: false,
      booking: null,
      loading: false,
      data: null,
      error: null,
    });
  };

  // Handle real-time status check for single booking
  const handleRealTimeCheck = async (booking) => {
    const bookingId = booking.bookingId;

    if (!bookingId) {
      toast.error("No booking ID available for real-time check");
      return;
    }

    setLoadingStatuses((prev) => new Set(prev.add(bookingId)));

    try {
      const result = await fetchRealTimeStatus(booking, userType);

      setRealTimeStatuses((prev) => ({
        ...prev,
        [bookingId]: result,
      }));

      if (result.success) {
        toast.success("Real-time status updated!");
      } else {
        toast.error(`Failed to update status: ${result.error}`);
      }
    } catch (error) {
      console.error("Error in real-time status check:", error);
      toast.error("Failed to fetch real-time status");
    } finally {
      setLoadingStatuses((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  // Auto-fetch real-time status for all current bookings
  const autoFetchRealTimeStatus = async () => {
    const { paginatedBookings } = getPaginatedBookings();

    const activeBookings = paginatedBookings.filter(
      (booking) =>
        booking.bookingStatus?.toLowerCase() === "confirmed" ||
        booking.status?.toLowerCase() === "confirmed"
    );

    if (activeBookings.length === 0) {
      console.log("No active bookings found for real-time status check");
      return;
    }

    console.log(
      `Auto-fetching real-time status for ${activeBookings.length} active bookings`
    );

    try {
      const results = await fetchMultipleRealTimeStatus(
        activeBookings,
        userType
      );
      setRealTimeStatuses((prev) => ({
        ...prev,
        ...results,
      }));
    } catch (error) {
      console.error("Error in auto-fetch real-time status:", error);
    }
  };

  // Enhanced data formatting with user type context
  const formatBookingData = (apiResponse, isUpcoming = false) => {
    console.log("Formatting booking data for user type:", userType);
    console.log("Raw API response:", apiResponse);

    let bookingsArray = [];

    if (Array.isArray(apiResponse)) {
      bookingsArray = apiResponse;
    } else if (apiResponse?.data && Array.isArray(apiResponse.data)) {
      bookingsArray = apiResponse.data;
    } else if (apiResponse?.bookings && Array.isArray(apiResponse.bookings)) {
      bookingsArray = apiResponse.bookings;
    } else if (apiResponse?.results && Array.isArray(apiResponse.results)) {
      bookingsArray = apiResponse.results;
    } else if (apiResponse?.response && Array.isArray(apiResponse.response)) {
      bookingsArray = apiResponse.response;
    } else if (typeof apiResponse === "object" && apiResponse !== null) {
      const possibleArrays = Object.values(apiResponse).filter(Array.isArray);
      if (possibleArrays.length > 0) {
        bookingsArray = possibleArrays[0];
      } else {
        console.warn("No array found in response object:", apiResponse);
        return [];
      }
    } else {
      console.warn("Unknown response structure:", apiResponse);
      return [];
    }

    console.log("Bookings array extracted:", bookingsArray.length, "items");

    const formattedBookings = bookingsArray.map((bookingWrapper, index) => {
      const booking = bookingWrapper.Result || bookingWrapper;

      const rawBookingId =
        bookingWrapper.bookingId ||
        bookingWrapper.BookingId ||
        booking.BookingId ||
        booking.bookingId ||
        booking.booking_id ||
        booking.id ||
        booking.Id ||
        booking.referenceId ||
        booking.confirmationId ||
        `${userType?.toUpperCase() || "BUS"}${Date.now()}${index}`;

      const bookingId = String(rawBookingId);

      const fromCity =
        booking.Origin ||
        booking.FromCity ||
        booking.fromCity ||
        booking.from ||
        booking.origin ||
        booking.source ||
        "N/A";
      const toCity =
        booking.Destination ||
        booking.ToCity ||
        booking.toCity ||
        booking.to ||
        booking.destination ||
        "N/A";

      const travelDate =
        booking.DateOfJourney ||
        booking.TravelDate ||
        booking.travelDate ||
        booking.departureDate ||
        booking.journeyDate ||
        booking.date ||
        "N/A";

      const busType =
        booking.BusType ||
        booking.busType ||
        booking.TravelName ||
        booking.operator ||
        booking.busName ||
        booking.serviceName ||
        "N/A";

      let seatNumber = "N/A";
      if (
        booking.Passenger &&
        Array.isArray(booking.Passenger) &&
        booking.Passenger.length > 0
      ) {
        const seats = booking.Passenger.map(
          (p) => p.SeatName || p.seatName
        ).filter(Boolean);
        seatNumber = seats.join(", ") || "N/A";
      } else {
        seatNumber =
          booking.SeatNumbers ||
          booking.seatNumbers ||
          booking.seats ||
          booking.seatNumber ||
          booking.SeatName ||
          "N/A";
      }

      const ticketNo =
        booking.TicketNo ||
        booking.ticketNo ||
        booking.ticketNumber ||
        booking.ticket ||
        "N/A";
      const pnr =
        booking.TravelOperatorPNR ||
        booking.PNR ||
        booking.pnr ||
        booking.referenceNumber ||
        booking.confirmationNumber ||
        "N/A";
      const bookingStatus =
        booking.Status ||
        booking.status ||
        booking.bookingStatus ||
        "Confirmed";

      const totalAmount =
        bookingWrapper.RasuTripInvoiceAmount ||
        booking.InvoiceAmount ||
        booking.TotalAmount ||
        booking.totalAmount ||
        booking.amount ||
        booking.fare ||
        booking.price ||
        booking.Price?.PublishedPrice ||
        booking.Price?.OfferedPrice ||
        "0";

      let passengerName = "N/A";
      let contactNumber = "N/A";
      if (
        booking.Passenger &&
        Array.isArray(booking.Passenger) &&
        booking.Passenger.length > 0
      ) {
        const leadPassenger =
          booking.Passenger.find((p) => p.LeadPassenger) ||
          booking.Passenger[0];
        passengerName =
          `${leadPassenger.FirstName || ""} ${
            leadPassenger.LastName || ""
          }`.trim() ||
          leadPassenger.name ||
          "N/A";
        contactNumber = leadPassenger.Phoneno || leadPassenger.phone || "N/A";
      } else {
        passengerName =
          booking.PassengerName ||
          booking.passengerName ||
          booking.leadPassengerName ||
          booking.name ||
          "N/A";
        contactNumber =
          booking.ContactNumber ||
          booking.contactNumber ||
          booking.mobile ||
          booking.phone ||
          "N/A";
      }

      const paymentStatus =
        booking.PaymentStatus ||
        booking.paymentStatus ||
        (bookingStatus === "Confirmed" ? "Completed" : "Processing");
      const createdAt =
        bookingWrapper.createdAt ||
        booking.BookingDate ||
        booking.bookingDate ||
        booking.InvoiceCreatedOn ||
        booking.createdAt ||
        booking.created_at ||
        new Date().toISOString();

      const formatCreatedDate = (dateString) => {
        try {
          const date = new Date(dateString);
          return (
            date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }) +
            " / " +
            date.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          );
        } catch {
          return "N/A";
        }
      };

      const formattedBooking = {
        bookingId: String(bookingId),
        from: String(fromCity),
        to: String(toCity),
        travelDate: String(travelDate),
        busType: String(busType),
        seatNumber: String(seatNumber),
        ticketNo: String(ticketNo),
        pnr: String(pnr),
        bookingStatus: String(bookingStatus),
        totalAmount: String(totalAmount),
        status: String(bookingStatus),
        passengerName: String(passengerName),
        contactNumber: String(contactNumber),
        paymentStatus: String(paymentStatus),
        createdAt: formatCreatedDate(createdAt),
        bookingDate: formatCreatedDate(createdAt),
        userType: userType || "customer",
        rawData: bookingWrapper,
      };

      console.log(
        `Formatted booking ${index + 1} for ${userType}:`,
        formattedBooking
      );
      return formattedBooking;
    });

    console.log("All formatted bookings:", formattedBookings.length, "items");
    return formattedBookings;
  };

  // Load bookings when component mounts or user changes
  useEffect(() => {
    loadAllBookingsComplete(); // Load all bookings from all pages
  }, [user]);

  // Auto-refresh real-time status every 3 minutes for current page only
  useEffect(() => {
    const interval = setInterval(() => {
      autoFetchRealTimeStatus();
    }, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, [allBookings, upcomingBookings, getCurrentPage()]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Format amount for display
  const formatAmount = (amount) => {
    if (!amount || amount === "0") return "₹0";
    if (typeof amount === "string" && amount.startsWith("₹")) return amount;
    return `₹${amount}`;
  };

  // Get user type display name
  const getUserTypeDisplay = () => {
    return userType === "agent" ? "Agent" : "Customer";
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const statusLower = String(status).toLowerCase();

    switch (statusLower) {
      case "confirmed":
      case "booked":
      case "active":
        return "bg-green-100 text-green-700";
      case "departed":
      case "in-transit":
      case "running":
        return "bg-blue-100 text-blue-700";
      case "completed":
      case "arrived":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-700";
      case "delayed":
      case "waiting":
        return "bg-yellow-100 text-yellow-700";
      case "pending":
      case "processing":
        return "bg-orange-100 text-orange-700";
      case "error":
        return "bg-red-100 text-red-700";
      case "unknown":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Render real-time status
  const renderRealTimeStatus = (booking) => {
    const bookingId = booking.bookingId;
    const isLoading = loadingStatuses.has(bookingId);
    const statusData = realTimeStatuses[bookingId];

    if (isLoading) {
      return (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
          <span className="text-xs text-gray-500">Checking...</span>
        </div>
      );
    }

    if (statusData?.error) {
      return (
        <div className="flex flex-col items-start">
          <span className="text-xs text-red-500">
            Error: {statusData.error}
          </span>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => handleRealTimeCheck(booking)}
              className="text-xs text-blue-500 hover:text-blue-700"
              title="Retry"
            >
              Retry
            </button>
            <button
              onClick={() => openStatusPopup(booking)}
              className="text-xs text-green-500 hover:text-green-700"
              title="View Details"
            >
              Status
            </button>
          </div>
        </div>
      );
    }

    if (statusData?.status && statusData.success) {
      return (
        <div className="flex flex-col items-start">
          <div className="flex items-center mt-1 gap-2">
            <button
              onClick={() => openStatusPopup(booking)}
              className="text-xs text-green-500 hover:text-green-700 font-medium"
              title="View Details"
            >
              Status
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openStatusPopup(booking)}
          className="text-xs text-green-500 hover:text-green-700 font-medium"
          title="View Details"
        >
          Status
        </button>
      </div>
    );
  };

  // Pagination Component
  const PaginationComponent = () => {
    const { totalPages, currentPage, totalItems } = getPaginatedBookings();

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="float-right flex-col sm:flex-row px-6 py-4 border-t border-gray-200 bg-gray-50">
        {/* Show API pagination info */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Showing {getCurrentBookings().length} of{" "}
            {getCurrentPagination().total} total bookings
            {getCurrentPagination().totalPages > 1 && (
              <span className="ml-2">
                (API has {getCurrentPagination().totalPages} pages total)
              </span>
            )}
          </div>
          {getCurrentPagination().totalPages > 1 &&
            getCurrentBookings().length < getCurrentPagination().total && (
              <button
                onClick={() => loadAllBookingsComplete()}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Load All Bookings ({getCurrentPagination().total})
              </button>
            )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            Previous
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => page !== "..." && setCurrentPage(page)}
              disabled={page === "..."}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-red-500 text-white"
                  : page === "..."
                  ? "text-gray-400 cursor-default"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Status Popup Component
  const StatusPopup = () => {
    if (!statusPopup.isOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        style={{ zIndex: 9999 }}
      >
        <div
          className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto"
          style={{
            maxWidth: "min(95vw, 1024px)",
            zIndex: 10000,
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h3 className="text-xl font-bold text-gray-800">
              Booking Status Details
            </h3>
            <button
              onClick={closeStatusPopup}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              title="Close"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {statusPopup.loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading booking details...</p>
              </div>
            ) : statusPopup.error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h4 className="text-lg font-medium text-red-600 mb-2">
                  Error Loading Details
                </h4>
                <p className="text-gray-600 mb-4">{statusPopup.error}</p>
                <button
                  onClick={() =>
                    fetchDetailedBookingStatus(statusPopup.booking)
                  }
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Try Again
                </button>
              </div>
            ) : statusPopup.data ? (
              <div className="space-y-6">
                {/* Booking Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Booking Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Bus Type
                      </label>
                      <p className="text-sm text-gray-800">
                        {statusPopup.data.bookingInfo.busType}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Seat Number(s)
                      </label>
                      <p className="text-sm text-gray-800">
                        {statusPopup.data.bookingInfo.seatNumber}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Passenger Name
                      </label>
                      <p className="text-sm text-gray-800">
                        {statusPopup.data.bookingInfo.passengerName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Contact Number
                      </label>
                      <p className="text-sm text-gray-800">
                        {statusPopup.data.bookingInfo.contactNumber}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Total Amount
                      </label>
                      <p className="text-sm font-bold text-green-600">
                        {formatAmount(statusPopup.data.bookingInfo.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Booking Status
                      </label>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          statusPopup.data.bookingInfo.bookingStatus
                        )}`}
                      >
                        {statusPopup.data.bookingInfo.bookingStatus}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Payment Status
                      </label>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          statusPopup.data.bookingInfo.paymentStatus ===
                          "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {statusPopup.data.bookingInfo.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Booking Date
                      </label>
                      <p className="text-sm text-gray-800">
                        {statusPopup.data.bookingInfo.bookingDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Real-Time Status */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Real-Time Status
                    </h4>
                    <button
                      onClick={() =>
                        fetchDetailedBookingStatus(statusPopup.booking)
                      }
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      disabled={statusPopup.loading}
                    >
                      {statusPopup.loading ? "Refreshing..." : "Refresh Status"}
                    </button>
                  </div>

                  {statusPopup.data.realTimeStatus ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Current Status
                        </label>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            statusPopup.data.realTimeStatus.currentStatus
                          )}`}
                        >
                          {statusPopup.data.realTimeStatus.currentStatus}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Last Updated
                        </label>
                        <p className="text-sm text-gray-800">
                          {new Date(
                            statusPopup.data.realTimeStatus.lastUpdated
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Bus Location
                        </label>
                        <p className="text-sm text-gray-800">
                          {statusPopup.data.realTimeStatus.busLocation}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Estimated Arrival
                        </label>
                        <p className="text-sm text-gray-800">
                          {statusPopup.data.realTimeStatus.estimatedArrival}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Delay Status
                        </label>
                        <p className="text-sm text-gray-800">
                          {statusPopup.data.realTimeStatus.delay}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Next Stop
                        </label>
                        <p className="text-sm text-gray-800">
                          {statusPopup.data.realTimeStatus.nextStop}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        Real-time status not available
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {statusPopup.data.error ||
                          "Status tracking may not be supported for this booking"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Important Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="text-yellow-500 mr-3 mt-1">ℹ️</div>
                      <div>
                        <p className="text-sm text-gray-700">
                          <strong>Real-time tracking:</strong> Status updates
                          are fetched from the bus operator's system and may
                          have delays.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-blue-500 mr-3 mt-1">📱</div>
                      <div>
                        <p className="text-sm text-gray-700">
                          <strong>Contact Support:</strong> For immediate
                          assistance, please contact our support team with your
                          booking ID.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="text-green-500 mr-3 mt-1">🎫</div>
                      <div>
                        <p className="text-sm text-gray-700">
                          <strong>E-ticket:</strong> Please carry a valid ID
                          along with your e-ticket during travel.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📄</div>
                <p className="text-gray-600">No booking details available</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              onClick={closeStatusPopup}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 text-lg">
            Loading your {getUserTypeDisplay().toLowerCase()} bus bookings...
          </p>
          <p className="text-gray-400 text-sm">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  const { paginatedBookings, totalPages, totalItems, currentPage } =
    getPaginatedBookings();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header with user type indicator */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h5 className="text-2xl font-bold text-gray-800">My Bus Bookings</h5>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div>
              <h3 className="text-red-800 font-medium">
                Error Loading {getUserTypeDisplay()} Bookings
              </h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button
                onClick={loadAllBookingsComplete}
                className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {debugInfo && debugInfo.errors && debugInfo.errors.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <strong>Debug Info ({debugInfo.userType}):</strong>{" "}
          {debugInfo.errors.join(", ")}
        </div>
      )}

      {/* Booking Type Tabs */}
      <div className="flex w-full mb-6 bg-gray-50 p-2 shadow-sm">
        <button
          className={`flex-1 text-center rounded-lg transition-all duration-300 font-semibold text-sm
                ${
                  bookingType === "upcoming"
                    ? "bg-red-500 text-white shadow-sm"
                    : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/70"
                }
            `}
          onClick={() => handleTabChange("upcoming")}
        >
          Upcoming Bookings
          {upcomingBookings.length > 0 && (
            <span
              className={`ml-2 px-2.5 py-1 text-xs rounded-full font-bold
                    ${
                      bookingType === "upcoming"
                        ? "bg-white text-red-500"
                        : "bg-red-100 text-red-600"
                    }
                `}
            >
              {upcomingBookings.length}
            </span>
          )}
        </button>

        <button
          className={`flex-1 text-center px-6 py-2 rounded-lg transition-all duration-300 font-semibold text-sm
                ${
                  bookingType === "all"
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/70"
                }
            `}
          onClick={() => handleTabChange("all")}
        >
          All Bookings
          {allBookings.length > 0 && (
            <span
              className={`ml-2 px-2.5 py-1 text-xs rounded-full font-bold
                    ${
                      bookingType === "all"
                        ? "bg-white text-red-500"
                        : "bg-red-100 text-red-600"
                    }
                `}
            >
              {allBookings.length}
            </span>
          )}
        </button>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Booking ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Route
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Travel Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Bus Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Seats
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Passenger
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Real-Time Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-50">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-4">🚌</span>
                      <span className="text-lg font-medium text-gray-600">
                        No {getUserTypeDisplay().toLowerCase()} bookings found
                      </span>
                      <span className="text-sm text-gray-400 mt-1">
                        {bookingType === "upcoming"
                          ? `Your upcoming trips as ${getUserTypeDisplay().toLowerCase()} will appear here`
                          : `Your booking history as ${getUserTypeDisplay().toLowerCase()} will appear here`}
                      </span>
                      <div className="mt-2 text-xs text-gray-500">
                        Type: {userType} | Upcoming: {upcomingBookings.length} |
                        All: {allBookings.length}
                      </div>
                      <button
                        onClick={loadAllBookingsComplete}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Refresh Bookings
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {booking.bookingId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {booking.from} → {booking.to}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDate(booking.travelDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {booking.busType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {booking.seatNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {booking.passengerName}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      {formatAmount(booking.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.bookingStatus.toLowerCase() === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {booking.createdAt}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div>
                        <Button
                          onClick={() => handleETicketDownload(booking)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-xs btn-red"
                        >
                          E-Ticket Download pdf
                        </Button>
                      </div>
                      <div>
                        <Button
                          onClick={() => handleInvoice(booking)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-xs btn-red"
                        >
                          Invoice View Download
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {renderRealTimeStatus(booking)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <PaginationComponent />
      </div>

      {/* Status Popup */}
      <StatusPopup />
    </div>
  );
};

export default BusBookingHistory;
