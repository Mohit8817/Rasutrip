import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import {
    fetchUpcomingHotelBookings,
    fetchAllHotelBookings,
    getHotelUserType,
    isHotelUserAuthenticated,
    fetchHotelRealTimeStatus,
    fetchMultipleHotelRealTimeStatus
} from "../../services/bookingApi";

const HotelBookingHistory = () => {
    const [bookingType, setBookingType] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [debugInfo, setDebugInfo] = useState(null);
    const [userRole, setUserRole] = useState('customer');
    const [sortOrder, setSortOrder] = useState('desc');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Real-time status states
    const [realTimeStatuses, setRealTimeStatuses] = useState({});
    const [loadingStatuses, setLoadingStatuses] = useState(new Set());
    const [initialStatusLoaded, setInitialStatusLoaded] = useState(false);

    // Invoice download states
    const [downloadingInvoices, setDownloadingInvoices] = useState(new Set());

    // Status popup states
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedBookingForStatus, setSelectedBookingForStatus] = useState(null);
    const [statusModalLoading, setStatusModalLoading] = useState(false);

    // Get user role on component mount
    useEffect(() => {
        const role = getHotelUserType();
        setUserRole(role || 'customer');
    }, []);

    // Reset pagination when booking type changes
    useEffect(() => {
        setCurrentPage(1);
    }, [bookingType]);

    // Handle opening status modal
    const handleOpenStatusModal = async (booking) => {
        setSelectedBookingForStatus(booking);
        setStatusModalOpen(true);
        setStatusModalLoading(true);

        // Fetch fresh real-time status for the modal
        try {
            const result = await fetchHotelRealTimeStatus(booking, userRole);

            // Update the real-time status in state
            setRealTimeStatuses(prev => ({
                ...prev,
                [booking.bookingId]: result
            }));

            if (!result.success) {
                toast.error(`Failed to fetch latest status: ${result.error}`);
            }
        } catch (error) {
            console.error('Error fetching status for modal:', error);
            toast.error('Failed to fetch latest booking status');
        } finally {
            setStatusModalLoading(false);
        }
    };

    // Handle closing status modal
    const handleCloseStatusModal = () => {
        setStatusModalOpen(false);
        setSelectedBookingForStatus(null);
        setStatusModalLoading(false);
    };

    // Handle real-time status check for single hotel booking
    const handleRealTimeCheck = async (booking) => {
        const bookingId = booking.bookingId;

        if (!bookingId) {
            toast.error('No booking ID available for real-time check');
            return;
        }

        setLoadingStatuses(prev => new Set(prev.add(bookingId)));

        try {
            const result = await fetchHotelRealTimeStatus(booking, userRole);

            setRealTimeStatuses(prev => ({
                ...prev,
                [bookingId]: result
            }));

            if (result.success) {
                toast.success('Real-time status updated!');
            } else {
                toast.error(`Failed to update status: ${result.error}`);
            }

        } catch (error) {
            console.error('Error in real-time status check:', error);
            toast.error('Failed to fetch real-time status');
        } finally {
            setLoadingStatuses(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookingId);
                return newSet;
            });
        }
    };

    // Auto-fetch real-time status for all current hotel bookings
    const autoFetchRealTimeStatus = async (bookings = null) => {
        const currentBookings = bookings || getCurrentBookings();

        const activeBookings = currentBookings.filter(booking =>
            booking.bookingStatus?.toLowerCase() === 'confirmed' ||
            booking.bookingStatus?.toLowerCase() === 'booked'
        );

        if (activeBookings.length === 0) {
            console.log('No active hotel bookings found for real-time status check');
            setInitialStatusLoaded(true);
            return;
        }

        console.log(`Auto-fetching real-time status for ${activeBookings.length} active hotel bookings`);

        const bookingIds = activeBookings.map(b => b.bookingId);
        setLoadingStatuses(prev => new Set([...prev, ...bookingIds]));

        try {
            const results = await fetchMultipleHotelRealTimeStatus(activeBookings, userRole);
            setRealTimeStatuses(prev => ({
                ...prev,
                ...results
            }));
            setInitialStatusLoaded(true);
        } catch (error) {
            console.error('Error in auto-fetch hotel real-time status:', error);
        } finally {
            setLoadingStatuses(prev => {
                const newSet = new Set(prev);
                bookingIds.forEach(id => newSet.delete(id));
                return newSet;
            });
        }
    };

    // Generate Invoice Data for a booking
    const generateInvoiceDataForBooking = (booking) => {
        const now = new Date();
        const invoiceNumber = `INV-HTL-${booking.bookingId}`;

        // Calculate nights properly
        const calculateNights = (checkIn, checkOut) => {
            try {
                const checkInDate = new Date(checkIn);
                const checkOutDate = new Date(checkOut);

                if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                    return 1;
                }

                const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
                const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
                return Math.max(1, Math.min(nights, 365));
            } catch (error) {
                console.error('Error calculating nights:', error);
                return 1;
            }
        };

        const noOfNights = calculateNights(booking.checkInDate, booking.checkOutDate);
        const totalAmount = parseFloat(booking.totalAmount.toString().replace(/[₹,]/g, '')) || 0;

        const baseFare = Math.round(totalAmount * 0.82) || 0;
        const taxes = Math.round(totalAmount * 0.15) || 0;
        const platformFee = Math.round(totalAmount * 0.03) || 0;

        return {
            // Basic Invoice Info
            invoiceId: invoiceNumber,
            invoiceNumber: invoiceNumber,
            invoiceDate: now.toLocaleDateString('en-IN'),
            bookingId: booking.bookingId,

            // Company Details (Supplier)
            supplierDetails: {
                name: 'RasuTrip Pvt. Ltd.',
                mobile: '+91-9876543210',
                email: 'support@rasutrip.com',
                pan: 'ABCDE1234F',
                state: 'Delhi',
                companyRegisteredNumber: 'U63040DL2020PTC367456'
            },

            // Customer Details
            receiverDetails: {
                name: booking.leadGuestName || 'Guest Name',
                phone: booking.contactNumber || 'N/A',
                email: booking.email || 'N/A'
            },

            // Hotel Details
            hotelName: booking.hotelName,
            destination: booking.city,
            address: `${booking.city} - ${booking.hotelCode}`,
            starRating: 3,

            // Booking Details
            checkInDate: formatDate(booking.checkInDate),
            checkOutDate: formatDate(booking.checkOutDate),
            checkInTime: new Date(booking.checkInDate).toISOString(),
            checkOutTime: new Date(booking.checkOutDate).toISOString(),
            noOfNights: noOfNights,
            noOfRooms: parseInt(booking.numberOfRooms) || 1,

            // Guest Details
            guest: {
                name: booking.leadGuestName || 'Guest Name',
                phone: booking.contactNumber || 'N/A',
                email: booking.email || 'N/A',
                age: 'N/A'
            },

            // Fare Details
            fareDetails: {
                baseFare: baseFare,
                taxes: taxes,
                platformFee: platformFee,
                couponDiscount: 0,
                IGSTRate: 18
            },

            // Payment
            totalPayable: totalAmount,
            invoiceTotal: totalAmount,

            // Additional booking info
            confirmationNo: booking.confirmationNo,
            bookingStatus: booking.bookingStatus,
            paymentStatus: booking.paymentStatus,
            roomType: booking.roomType,
            numberOfGuests: booking.numberOfGuests
        };
    };

    // Generate HTML Invoice (same as confirmation page)
    const generateInvoiceHTMLForBooking = (invoiceData) => {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ccc; padding: 20px;">
          <h2 style="text-align: center; color: #2c3e50;">Tax Invoice (Hotel Booking)</h2>

          <table style="width: 100%; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td>
                <strong>From :</strong> ${invoiceData.supplierDetails.name}<br />
                <strong>Mobile :</strong> ${invoiceData.supplierDetails.mobile}<br />
                <strong>Email :</strong> ${invoiceData.supplierDetails.email}<br />
                <strong>PAN Number :</strong> ${invoiceData.supplierDetails.pan}<br />
                <strong>State :</strong> ${invoiceData.supplierDetails.state}<br />
                <strong>Company Registered No. :</strong> ${invoiceData.supplierDetails.companyRegisteredNumber}
              </td>
              <td style="text-align: right;">
                <strong>Guest Name :</strong> ${invoiceData.receiverDetails.name}<br />
                <strong>Phone :</strong> ${invoiceData.receiverDetails.phone}<br />
                <strong>Email :</strong> ${invoiceData.receiverDetails.email}
              </td>
            </tr>
          </table>

          <table style="width: 100%; font-size: 14px; margin-bottom: 20px;" border="1" cellpadding="8" cellspacing="0">
            <tr>
              <td><strong>Invoice Number :</strong> ${invoiceData.invoiceId}</td>
              <td><strong>Invoice Date :</strong> ${invoiceData.invoiceDate}</td>
            </tr>
            <tr>
              <td><strong>Booking ID :</strong> ${invoiceData.bookingId}</td>
              <td><strong>Confirmation No :</strong> ${invoiceData.confirmationNo}</td>
            </tr>
            <tr>
              <td><strong>Booking Status :</strong> ${invoiceData.bookingStatus}</td>
              <td><strong>Payment Status :</strong> ${invoiceData.paymentStatus}</td>
            </tr>
            <tr>
              <td><strong>Check-In :</strong> ${invoiceData.checkInDate}</td>
              <td><strong>Check-Out :</strong> ${invoiceData.checkOutDate}</td>
            </tr>
            <tr>
              <td><strong>No. of Nights :</strong> ${invoiceData.noOfNights}</td>
              <td><strong>No. of Rooms :</strong> ${invoiceData.noOfRooms}</td>
            </tr>
          </table>

          <h3 style="color: #2c3e50;">HOTEL DETAILS</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;" border="1" cellpadding="8" cellspacing="0">
            <tr>
              <td><strong>Hotel Name</strong></td>
              <td>${invoiceData.hotelName}</td>
            </tr>
            <tr>
              <td><strong>Hotel Code</strong></td>
              <td>${invoiceData.bookingId.includes('HTL') ? invoiceData.bookingId : 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Destination</strong></td>
              <td>${invoiceData.destination}</td>
            </tr>
            <tr>
              <td><strong>Address</strong></td>
              <td>${invoiceData.address}</td>
            </tr>
            <tr>
              <td><strong>Room Type</strong></td>
              <td>${invoiceData.roomType}</td>
            </tr>
            <tr>
              <td><strong>Star Rating</strong></td>
              <td>${invoiceData.starRating}</td>
            </tr>
          </table>

          <h3 style="color: #2c3e50;">GUEST DETAILS</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;" border="1" cellpadding="8" cellspacing="0">
            <tr>
              <th>#</th>
              <th>Guest Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Total Guests</th>
            </tr>
            <tr>
              <td>1</td>
              <td>${invoiceData.guest.name}</td>
              <td>${invoiceData.guest.phone}</td>
              <td>${invoiceData.guest.email}</td>
              <td>${invoiceData.numberOfGuests}</td>
            </tr>
          </table>

          <h3 style="color: #2c3e50;">PAYMENT DETAILS</h3>
          <table style="width: 100%; font-size: 14px; margin-bottom: 20px;" cellpadding="8" cellspacing="0">
            <tr><td><strong>Room Fare (${invoiceData.noOfNights} nights):</strong></td><td>₹ ${invoiceData.fareDetails.baseFare.toLocaleString()}</td></tr>
            <tr><td><strong>Taxes & Fees:</strong></td><td>₹ ${invoiceData.fareDetails.taxes.toLocaleString()}</td></tr>
            <tr><td><strong>Platform Fee:</strong></td><td>₹ ${invoiceData.fareDetails.platformFee.toLocaleString()}</td></tr>
            <tr><td><strong>Coupon Discount (-):</strong></td><td>₹ ${invoiceData.fareDetails.couponDiscount}</td></tr>
            <tr><td><strong>IGST Rate:</strong></td><td>${invoiceData.fareDetails.IGSTRate}%</td></tr>
            <tr style="border-top: 2px solid #000;">
              <td><strong>Total Payable:</strong></td>
              <td><strong>₹ ${invoiceData.totalPayable.toLocaleString()}</strong></td>
            </tr>
          </table>

          <h3 style="margin-top: 30px; color: #2c3e50;">CHECK-IN & CHECK-OUT DETAILS</h3>
          <table style="width: 100%; font-size: 14px; margin-bottom: 20px;" cellpadding="8" cellspacing="0">
            <tr>
              <td style="vertical-align: top; width: 50%;">
                <strong>Check-In:</strong><br>
                Date: ${invoiceData.checkInDate}<br>
                Time: 2:00 PM onwards<br>
                Hotel: ${invoiceData.hotelName}<br>
                Address: ${invoiceData.address}
              </td>
              <td style="vertical-align: top; width: 50%;">
                <strong>Check-Out:</strong><br>
                Date: ${invoiceData.checkOutDate}<br>
                Time: 11:00 AM<br>
                Total Stay: ${invoiceData.noOfNights} night(s)
              </td>
            </tr>
          </table>

          <h3 style="margin-top: 30px; color: #2c3e50;">CANCELLATION POLICY</h3>
          <ul style="font-size: 14px; padding-left: 20px; margin-bottom: 20px;">
            <li>Free cancellation up to 24 hours before check-in</li>
            <li>50% charges for cancellation within 24 hours</li>
            <li>100% charges for no-show</li>
            <li>Refunds will be processed within 7-10 working days</li>
          </ul>

          <h3 style="margin-top: 30px; color: #2c3e50;">TERMS & CONDITIONS</h3>
          <ul style="font-size: 14px; padding-left: 20px;">
            <li>This is a computer-generated invoice; no signature required.</li>
            <li>All disputes are subject to jurisdiction of New Delhi.</li>
            <li>Guests must present valid ID proof (Passport/Voter ID/Aadhar Card).</li>
            <li>Hotel rules and policies apply as per hotel management.</li>
            <li>Check-in time is 2:00 PM and check-out time is 11:00 AM.</li>
            <li>Number of nights: ${invoiceData.noOfNights} (${invoiceData.checkInDate} to ${invoiceData.checkOutDate})</li>
            <li>For any queries, contact our support team at ${invoiceData.supplierDetails.email}</li>
          </ul>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
            <small style="color: #7f8c8d;">Thank you for choosing RasuTrip! Have a pleasant stay!</small>
          </div>
        </div>
    `;
    };

    // Handle Download Invoice for individual booking
    const handleDownloadInvoiceForBooking = (booking) => {
        const bookingId = booking.bookingId;

        setDownloadingInvoices(prev => new Set(prev.add(bookingId)));

        try {
            const invoiceData = generateInvoiceDataForBooking(booking);
            const htmlContent = generateInvoiceHTMLForBooking(invoiceData);

            // Create a new window/tab for printing
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Hotel Invoice - ${invoiceData.invoiceNumber}</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        @page { margin: 0.5in; }
                    }
                </style>
            </head>
            <body>
                ${htmlContent}
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `);
            printWindow.document.close();

            toast.success('Invoice opened for download/print!', {
                position: "top-right",
                autoClose: 3000
            });
        } catch (error) {
            console.error('Error generating invoice:', error);
            toast.error('Error generating invoice. Please try again.', {
                position: "top-right",
                autoClose: 3000
            });
        } finally {
            setDownloadingInvoices(prev => {
                const newSet = new Set(prev);
                newSet.delete(bookingId);
                return newSet;
            });
        }
    };

    // Format hotel booking data with enhanced confirmation number mapping
    const formatHotelBookingData = (apiResponse, isUpcoming = false) => {
        console.log('📊 Raw API response for formatting:', apiResponse);

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
        } else if (typeof apiResponse === 'object' && apiResponse !== null) {
            const possibleArrays = Object.values(apiResponse).filter(Array.isArray);
            if (possibleArrays.length > 0) {
                bookingsArray = possibleArrays[0];
                console.log('📋 Found array in object:', possibleArrays[0]);
            } else {
                console.warn('⚠️ No array found in response object:', apiResponse);
                return [];
            }
        } else {
            console.warn('⚠️ Unknown response structure:', apiResponse);
            return [];
        }

        console.log('📋 Hotel bookings array extracted:', bookingsArray);

        const formattedBookings = bookingsArray.map((bookingWrapper, index) => {
            console.log(`🏨 Processing hotel booking ${index + 1}:`, bookingWrapper);

            const booking = bookingWrapper.Result || bookingWrapper;
            console.log(`🏨 Actual hotel booking data for ${index + 1}:`, booking);

            const bookingId = bookingWrapper.bookingId ||
                bookingWrapper.BookingId ||
                bookingWrapper.BookingID ||
                booking.BookingId ||
                booking.bookingId ||
                booking.booking_id ||
                booking.id ||
                booking.Id ||
                booking.referenceId ||
                booking.confirmationId ||
                booking.HotelBookingId ||
                booking.userId ||
                `HTL${Date.now()}${index}`;

            const confirmationNo =
                booking.ConfirmationNo ||
                booking.confirmationNumber ||
                booking.confirmation_no ||
                booking.confirmationNo ||
                booking.ConfirmationNumber ||
                booking.referenceNumber ||
                booking.ReferenceNumber ||
                booking.reference_number ||
                booking.PNR ||
                booking.pnr ||
                booking.Pnr ||
                booking.BookingReference ||
                booking.bookingReference ||
                booking.booking_reference ||
                booking.BookingRef ||
                booking.bookingRef ||
                booking.HotelConfirmationNo ||
                booking.hotelConfirmationNo ||
                booking.hotel_confirmation_no ||
                booking.HotelReference ||
                booking.hotelReference ||
                bookingWrapper.bookingId ||
                booking.BookingId ||
                booking.bookingId ||
                'PENDING';

            // Hotel information mapping with fallback handling
            const hotelName = booking.HotelName ||
                booking.hotelName ||
                booking.hotel_name ||
                booking.name ||
                booking.propertyName ||
                booking.hotel ||
                booking.Hotel ||
                'Hotel Name Not Available';

            const hotelCode = booking.HotelCode ||
                booking.hotelCode ||
                booking.hotel_code ||
                booking.code ||
                booking.propertyCode ||
                booking.Code ||
                'Not Available';

            const city = booking.City ||
                booking.city ||
                booking.location ||
                booking.destination ||
                booking.CityName ||
                booking.cityName ||
                'Not Available';

            const checkInDate = booking.CheckIn ||
                booking.checkInDate ||
                booking.check_in_date ||
                booking.arrivalDate ||
                booking.CheckInDate ||
                booking.fromDate ||
                'N/A';

            const checkOutDate = booking.CheckOut ||
                booking.checkOutDate ||
                booking.check_out_date ||
                booking.departureDate ||
                booking.CheckOutDate ||
                booking.toDate ||
                'N/A';

            let roomType = 'Standard Room';
            let numberOfRooms = '1';
            let numberOfGuests = 'N/A';

            if (booking.HotelRoomsDetails && Array.isArray(booking.HotelRoomsDetails) && booking.HotelRoomsDetails.length > 0) {
                const firstRoom = booking.HotelRoomsDetails[0];

                roomType = firstRoom.RoomTypeName ||
                    firstRoom.RoomType ||
                    firstRoom.roomTypeName ||
                    firstRoom.roomType ||
                    booking.RoomType ||
                    booking.roomType ||
                    'Standard Room';

                numberOfRooms = booking.HotelRoomsDetails.length.toString();

                let totalGuests = 0;
                booking.HotelRoomsDetails.forEach(room => {
                    if (room.HotelPassenger && Array.isArray(room.HotelPassenger)) {
                        totalGuests += room.HotelPassenger.length;
                    }
                });
                numberOfGuests = totalGuests > 0 ? totalGuests.toString() : 'N/A';
            } else if (booking.roomType || booking.RoomType) {
                roomType = booking.roomType || booking.RoomType;
            }

            // Fixed booking status mapping
            const bookingStatus = booking.Status ||
                booking.status ||
                booking.bookingStatus ||
                booking.BookingStatus ||
                booking.confirmationStatus ||
                booking.booking_status ||
                (booking.IsConfirmed === true || booking.isConfirmed === true ? 'Confirmed' : 'Pending');

            const totalAmount = bookingWrapper.RasuTripInvoiceAmount ||
                booking.InvoiceAmount ||
                booking.TotalAmount ||
                booking.totalAmount ||
                booking.amount ||
                booking.fare ||
                booking.price ||
                booking.Amount ||
                '0';

            let leadGuestName = 'N/A';
            let contactNumber = 'N/A';
            let email = 'N/A';

            if (booking.HotelRoomsDetails && Array.isArray(booking.HotelRoomsDetails) && booking.HotelRoomsDetails.length > 0) {
                const firstRoom = booking.HotelRoomsDetails[0];
                if (firstRoom.HotelPassenger && Array.isArray(firstRoom.HotelPassenger) && firstRoom.HotelPassenger.length > 0) {
                    const leadGuest = firstRoom.HotelPassenger.find(p => p.LeadPassenger === "true") || firstRoom.HotelPassenger[0];
                    leadGuestName = `${leadGuest.Title || ''} ${leadGuest.FirstName || ''} ${leadGuest.LastName || ''}`.trim();
                    contactNumber = leadGuest.Phoneno || leadGuest.phone || 'N/A';
                    email = leadGuest.Email || leadGuest.email || 'N/A';
                }
            }

            // Fixed payment status mapping
            const paymentStatus = booking.PaymentStatus ||
                booking.paymentStatus ||
                booking.payment_status ||
                (bookingStatus === 'Confirmed' ? 'Completed' :
                    bookingStatus === 'Cancelled' ? 'Refunded' :
                        bookingStatus === 'Pending' ? 'Processing' : 'Pending');

            const createdAt = bookingWrapper.createdAt ||
                booking.BookingDate ||
                booking.bookingDate ||
                booking.InvoiceCreatedOn ||
                booking.createdAt ||
                booking.created_at ||
                new Date().toISOString();

            const formatCreatedDate = (dateString) => {
                try {
                    const date = new Date(dateString);
                    return date.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }) + ' / ' + date.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                } catch {
                    return 'N/A';
                }
            };

            const calculateNights = (checkIn, checkOut) => {
                try {
                    const checkInDate = new Date(checkIn);
                    const checkOutDate = new Date(checkOut);
                    const timeDiff = checkOutDate - checkInDate;
                    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                    return nights > 0 ? nights : 1;
                } catch {
                    return 1;
                }
            };

            const nights = calculateNights(checkInDate, checkOutDate);

            const searchTokenId = bookingWrapper.SearchTokenId ||
                booking.SearchTokenId ||
                booking.searchTokenId ||
                booking.token_id ||
                null;

            const formattedBooking = {
                bookingId: String(bookingId),
                hotelName: String(hotelName),
                hotelCode: String(hotelCode),
                city: String(city),
                checkInDate: String(checkInDate),
                checkOutDate: String(checkOutDate),
                roomType: String(roomType),
                numberOfRooms: String(numberOfRooms),
                numberOfGuests: String(numberOfGuests),
                nights: nights,
                confirmationNo: String(confirmationNo),
                bookingStatus: String(bookingStatus),
                totalAmount: String(totalAmount),
                leadGuestName: String(leadGuestName),
                contactNumber: String(contactNumber),
                email: String(email),
                paymentStatus: String(paymentStatus),
                createdAt: formatCreatedDate(createdAt),
                rawCreatedDate: new Date(createdAt),
                bookedByRole: booking.bookedByRole || userRole || 'customer',
                isAgentBooking: booking.isAgentBooking || userRole === 'agent',
                bookingSource: booking.bookingSource || (userRole === 'agent' ? 'AGENT_PORTAL' : 'CUSTOMER_PORTAL'),
                searchTokenId: searchTokenId,
                rawData: bookingWrapper
            };

            console.log(`Hotel booking ${index + 1} formatted with confirmation: ${confirmationNo}`, formattedBooking);
            return formattedBooking;
        });

        return formattedBookings;
    };

    // Sort bookings by date function
    const sortBookingsByDate = (bookings, order = 'desc') => {
        console.log(`Sorting ${bookings.length} hotel bookings by date (${order})`);

        const sortedBookings = [...bookings].sort((a, b) => {
            const dateA = a.rawCreatedDate || new Date(a.createdAt || 0);
            const dateB = b.rawCreatedDate || new Date(b.createdAt || 0);

            if (order === 'desc') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });

        return sortedBookings;
    };

    // Updated loadHotelBookings function
    const loadHotelBookings = async () => {
        setLoading(true);
        setError(null);
        setDebugInfo(null);
        setInitialStatusLoaded(false);

        if (!isHotelUserAuthenticated()) {
            setError('Please login to view your hotel booking history.');
            setLoading(false);
            return;
        }

        try {
            console.log('Starting to load ALL hotel bookings using service...');

            let upcomingData = [];
            let allData = [];
            let debugData = {
                upcomingSuccess: false,
                allBookingsSuccess: false,
                upcomingTotal: 0,
                allTotal: 0,
                errors: []
            };

            // Fetch upcoming bookings with all pages
            try {
                console.log('Fetching ALL upcoming hotel bookings...');
                const upcomingResponse = await fetchUpcomingHotelBookings(userRole);

                if (upcomingResponse.success) {
                    upcomingData = formatHotelBookingData(upcomingResponse.data, true);
                    upcomingData = sortBookingsByDate(upcomingData, sortOrder);
                    debugData.upcomingSuccess = true;
                    debugData.upcomingTotal = upcomingResponse.totalBookings || upcomingData.length;
                    debugData.upcomingResponse = upcomingResponse.data;
                    console.log(`✅ Upcoming hotel bookings loaded: ${upcomingData.length} total bookings`);
                }
            } catch (err) {
                console.warn('Failed to fetch upcoming hotel bookings:', err.message);
                debugData.errors.push(`Upcoming: ${err.message || 'Unknown error'}`);
            }

            // Fetch all bookings with all pages
            try {
                console.log('Fetching ALL hotel bookings...');
                const allResponse = await fetchAllHotelBookings(userRole);

                if (allResponse.success) {
                    allData = formatHotelBookingData(allResponse.data, false);
                    allData = sortBookingsByDate(allData, sortOrder);
                    debugData.allBookingsSuccess = true;
                    debugData.allTotal = allResponse.totalBookings || allData.length;
                    debugData.allResponse = allResponse.data;
                    console.log(`✅ All hotel bookings loaded: ${allData.length} total bookings`);
                }
            } catch (err) {
                console.warn('Failed to fetch all hotel bookings:', err.message);
                debugData.errors.push(`All bookings: ${err.message || 'Unknown error'}`);
            }

            console.log('Updating state with ALL hotel booking data...');
            setUpcomingBookings([...upcomingData]);
            setAllBookings([...allData]);
            setDebugInfo(debugData);

            const allLoadedBookings = [...upcomingData, ...allData];
            if (allLoadedBookings.length > 0) {
                console.log('Immediately fetching real-time status for ALL loaded hotel bookings...');
                setTimeout(() => {
                    autoFetchRealTimeStatus(allLoadedBookings);
                }, 500);
            } else {
                setInitialStatusLoaded(true);
            }

            if (upcomingData.length > 0 || allData.length > 0) {
                console.log(`🎉 Successfully loaded ALL hotel booking data:
                - Upcoming: ${upcomingData.length} bookings
                - All: ${allData.length} bookings  
                - Total fetched from API: Upcoming=${debugData.upcomingTotal}, All=${debugData.allTotal}`);
            } else if (debugData.errors.length === 0) {
                console.log('No hotel bookings found in API response');
            }

        } catch (error) {
            console.error('Error loading hotel bookings:', error);
            setError(error.message || 'Failed to load hotel booking history. Please try again.');
            setDebugInfo({ error: error.message, fullError: error });
            setInitialStatusLoaded(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHotelBookings();
    }, []);

    useEffect(() => {
        if (upcomingBookings.length > 0) {
            setUpcomingBookings(prev => sortBookingsByDate(prev, sortOrder));
        }
        if (allBookings.length > 0) {
            setAllBookings(prev => sortBookingsByDate(prev, sortOrder));
        }
    }, [sortOrder]);

    useEffect(() => {
        if (!initialStatusLoaded) return;

        const interval = setInterval(() => {
            console.log('Auto-refreshing hotel real-time status...');
            autoFetchRealTimeStatus();
        }, 300000);

        return () => clearInterval(interval);
    }, [allBookings, upcomingBookings, initialStatusLoaded]);

    const getCurrentBookings = () => {
        console.log('Getting current hotel bookings for type:', bookingType);
        if (bookingType === 'upcoming') {
            return upcomingBookings;
        }
        return allBookings;
    };

    // Pagination functions
    const getCurrentPageBookings = () => {
        const allBookings = getCurrentBookings();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return allBookings.slice(startIndex, endIndex);
    };

    const getTotalPages = () => {
        const totalBookings = getCurrentBookings().length;
        return Math.ceil(totalBookings / itemsPerPage);
    };

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const goToNextPage = () => {
        const totalPages = getTotalPages();
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const currentBookings = getCurrentPageBookings();
    const totalBookings = getCurrentBookings().length;
    const totalPages = getTotalPages();

    const formatDate = (dateString) => {
        if (!dateString || dateString === 'N/A') return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const formatAmount = (amount) => {
        if (!amount || amount === '0') return '₹0';
        if (typeof amount === 'string' && amount.startsWith('₹')) return amount;
        return `₹${amount}`;
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
        setCurrentPage(1); // Reset to first page when sorting changes
    };

    const getStatusColor = (status) => {
        const statusLower = String(status).toLowerCase();

        switch (statusLower) {
            case 'confirmed':
            case 'booked':
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'checked-in':
            case 'in-stay':
                return 'bg-blue-100 text-blue-700';
            case 'completed':
            case 'checked-out':
                return 'bg-purple-100 text-purple-700';
            case 'cancelled':
            case 'failed':
                return 'bg-red-100 text-red-700';
            case 'no-show':
            case 'waiting':
                return 'bg-yellow-100 text-yellow-700';
            case 'pending':
            case 'processing':
                return 'bg-orange-100 text-orange-700';
            case 'error':
                return 'bg-red-100 text-red-700';
            case 'unknown':
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getPaymentStatusColor = (status) => {
        const statusLower = String(status).toLowerCase();

        switch (statusLower) {
            case 'completed':
            case 'paid':
            case 'success':
                return 'text-green-600';
            case 'processing':
            case 'pending':
                return 'text-orange-600';
            case 'failed':
            case 'cancelled':
                return 'text-red-600';
            case 'refunded':
                return 'text-purple-600';
            default:
                return 'text-blue-600';
        }
    };

    // Pagination Component
    const PaginationControls = ({ currentPage, totalPages, totalItems, onPageChange, onPrevious, onNext }) => {
        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;

            if (totalPages <= maxVisiblePages) {
                // Show all pages if total pages are less than or equal to max visible
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Show first page, current page with neighbors, and last page
                if (currentPage <= 3) {
                    for (let i = 1; i <= 4; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                } else if (currentPage >= totalPages - 2) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                        pages.push(i);
                    }
                } else {
                    pages.push(1);
                    pages.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                }
            }

            return pages;
        };

        if (totalPages <= 1) return null;

        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        return (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                    Showing {startItem} to {endItem} of {totalItems} bookings
                </div>

                <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                        onClick={onPrevious}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                        {getPageNumbers().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => page !== '...' && onPageChange(page)}
                                disabled={page === '...'}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${page === currentPage
                                    ? 'bg-red-500 text-white'
                                    : page === '...'
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={onNext}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    // Status Modal Component
    const StatusModal = ({ booking, statusData, isLoading, onClose }) => {
        if (!booking) return null;

        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                style={{ zIndex: 9999 }}
            >
                <div
                    className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto"
                    style={{
                        maxWidth: 'min(95vw, 1024px)',
                        zIndex: 10000
                    }}
                >
                    {/* Modal Header */}
                    <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Hotel Booking Status Details
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            title="Close"
                        >
                            ×
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                <p className="text-gray-600">Loading booking details...</p>
                            </div>
                        ) : (
                            <>
                                {/* Booking Info */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h3 className="font-semibold text-gray-800 mb-3">Hotel Booking Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-600">Booking ID:</span>
                                            <span className="ml-2 font-mono text-gray-800">{booking.bookingId}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Confirmation No:</span>
                                            <span className="ml-2 font-mono text-gray-800">{booking.confirmationNo}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Hotel Name:</span>
                                            <span className="ml-2 text-gray-800">{booking.hotelName}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">City:</span>
                                            <span className="ml-2 text-gray-800">{booking.city}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Room Type:</span>
                                            <span className="ml-2 text-gray-800">{booking.roomType}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Rooms/Guests:</span>
                                            <span className="ml-2 text-gray-800">{booking.numberOfRooms} room(s), {booking.numberOfGuests} guest(s)</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Check-in:</span>
                                            <span className="ml-2 text-gray-800">{formatDate(booking.checkInDate)}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Check-out:</span>
                                            <span className="ml-2 text-gray-800">{formatDate(booking.checkOutDate)}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Nights:</span>
                                            <span className="ml-2 text-gray-800">{booking.nights} night(s)</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Lead Guest:</span>
                                            <span className="ml-2 text-gray-800">{booking.leadGuestName}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Contact:</span>
                                            <span className="ml-2 text-gray-800">{booking.contactNumber}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-600">Total Amount:</span>
                                            <span className="ml-2 text-gray-800 font-bold text-green-600">{formatAmount(booking.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Status Section */}
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-800 mb-3">Current Status</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-700 mb-2">Booking Status</h4>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.bookingStatus)}`}>
                                                {booking.bookingStatus}
                                            </span>
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            <h4 className="font-medium text-gray-700 mb-2">Payment Status</h4>
                                            <span className={`font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                                {booking.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Real-Time Status Section */}
                                {statusData && (
                                    <div className="mb-6">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-semibold text-gray-800">Real-Time Status</h3>
                                                <button
                                                    onClick={() => handleRealTimeCheck(booking)}
                                                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? 'Refreshing...' : 'Refresh Status'}
                                                </button>
                                            </div>

                                            {statusData.success ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="font-medium text-gray-600">Current Status:</span>
                                                        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(statusData.status)}`}>
                                                            {statusData.status}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-600">Last Updated:</span>
                                                        <span className="ml-2 text-gray-800">
                                                            {statusData.lastUpdated ? new Date(statusData.lastUpdated).toLocaleString('en-IN') : 'Just now'}
                                                        </span>
                                                    </div>
                                                    {statusData.location && (
                                                        <div>
                                                            <span className="font-medium text-gray-600">Hotel Location:</span>
                                                            <span className="ml-2 text-gray-800">{statusData.location}</span>
                                                        </div>
                                                    )}
                                                    {statusData.checkInTime && (
                                                        <div>
                                                            <span className="font-medium text-gray-600">Check-in Time:</span>
                                                            <span className="ml-2 text-gray-800">{statusData.checkInTime}</span>
                                                        </div>
                                                    )}
                                                    {statusData.checkOutTime && (
                                                        <div>
                                                            <span className="font-medium text-gray-600">Check-out Time:</span>
                                                            <span className="ml-2 text-gray-800">{statusData.checkOutTime}</span>
                                                        </div>
                                                    )}
                                                    {statusData.roomNumber && (
                                                        <div>
                                                            <span className="font-medium text-gray-600">Room Number:</span>
                                                            <span className="ml-2 text-gray-800">{statusData.roomNumber}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500">Real-time status not available</p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {statusData.error || 'Status tracking may not be supported for this hotel booking'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Timeline Section */}
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-800 mb-3">Booking Timeline</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-800">Booking Created</div>
                                                <div className="text-xs text-gray-500">{booking.createdAt}</div>
                                            </div>
                                        </div>

                                        {booking.bookingStatus === 'Confirmed' && (
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-800">Booking Confirmed</div>
                                                    <div className="text-xs text-gray-500">Confirmation No: {booking.confirmationNo}</div>
                                                </div>
                                            </div>
                                        )}

                                        {statusData?.status && statusData.success && statusData.status !== booking.bookingStatus && (
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-3 ${statusData.status.toLowerCase().includes('check') ? 'bg-purple-500' : 'bg-orange-500'}`}></div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-800">Real-time Status: {statusData.status}</div>
                                                    <div className="text-xs text-gray-500">Updated: {statusData.lastUpdated ? new Date(statusData.lastUpdated).toLocaleString('en-IN') : 'Just now'}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Important Information */}
                                <div className="bg-yellow-50 rounded-lg p-4">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Important Information</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <div className="text-yellow-500 mr-3 mt-1">ℹ️</div>
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    <strong>Hotel Check-in:</strong> Please carry a valid ID along with your booking confirmation during check-in.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="text-blue-500 mr-3 mt-1">📱</div>
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    <strong>Contact Support:</strong> For immediate assistance, please contact our support team with your booking ID.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="text-green-500 mr-3 mt-1">🏨</div>
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    <strong>Hotel Policies:</strong> Check-in and check-out times may vary. Please verify with the hotel directly.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200 sticky bottom-0">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your hotel bookings...</p>
                    <p className="text-gray-400 text-sm">This may take a few seconds</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h5 className="text-2xl font-bold text-gray-800">My Hotel Bookings</h5>
                        {totalBookings > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                Total {totalBookings} bookings found
                            </p>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <div>
                                <h3 className="text-red-800 font-medium">Error Loading Hotel Bookings</h3>
                                <p className="text-red-600 mt-1">{error}</p>
                                <button
                                    onClick={loadHotelBookings}
                                    className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {debugInfo && debugInfo.errors && debugInfo.errors.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <strong>Debug Info:</strong> {debugInfo.errors.join(', ')}
                    </div>
                )}

                {/* Booking Type Tabs */}
                <div className="flex w-full mb-6 bg-gray-50 p-2 shadow-sm">
                    <button
                        className={`flex-1 text-center rounded-lg transition-all duration-300 font-semibold text-sm px-6 py-2
                ${bookingType === 'upcoming'
                                ? 'bg-red-500 text-white shadow-sm'
                                : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/70'}
            `}
                        onClick={() => setBookingType('upcoming')}
                    >
                        Upcoming Bookings
                        {upcomingBookings.length > 0 && (
                            <span className={`ml-2 px-2.5 py-1 text-xs rounded-full font-bold
                    ${bookingType === 'upcoming'
                                    ? 'bg-white text-red-500'
                                    : 'bg-red-100 text-red-600'}
                `}>
                                {upcomingBookings.length}
                            </span>
                        )}
                    </button>

                    <button
                        className={`flex-1 text-center px-6 py-2 rounded-lg transition-all duration-300 font-semibold text-sm
                ${bookingType === 'all'
                                ? 'bg-red-500 text-white shadow-md'
                                : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-white/70'}
            `}
                        onClick={() => setBookingType('all')}
                    >
                        All Bookings
                        {allBookings.length > 0 && (
                            <span className={`ml-2 px-2.5 py-1 text-xs rounded-full font-bold
                    ${bookingType === 'all'
                                    ? 'bg-white text-red-500'
                                    : 'bg-red-100 text-red-600'}
                `}>
                                {allBookings.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Hotel Bookings Table */}
                <div className="bg-white rounded border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Booking ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Hotel Details</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Check-in</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Check-out</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nights</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rooms/Guests</th>
                                    <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 w-20">Room Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Confirmation No.</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Booking Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total Amount</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Payment Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                                        onClick={toggleSortOrder}
                                        title="Click to change sort order">
                                        Booked On {sortOrder === 'desc' ? '↓' : '↑'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Real-Time Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-50">
                                {console.log('Rendering table rows for:', currentBookings.length, 'hotel bookings')}
                                {currentBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="14" className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-lg font-medium text-gray-600">No hotel bookings found</span>
                                                <span className="text-sm text-gray-400 mt-1">
                                                    {bookingType === 'upcoming'
                                                        ? 'Your upcoming hotel stays will appear here'
                                                        : 'Your hotel booking history will appear here'
                                                    }
                                                </span>
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Debug: Upcoming={upcomingBookings.length}, All={allBookings.length}, Current={currentBookings.length}
                                                    <br />
                                                    Sort Order: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                                                    <br />
                                                    Page: {currentPage} of {totalPages}
                                                </div>
                                                <button
                                                    onClick={loadHotelBookings}
                                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                >
                                                    Refresh Bookings
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentBookings.map((booking, index) => {
                                        console.log(`Rendering row ${index + 1}:`, booking);
                                        const isDownloadingInvoice = downloadingInvoices.has(booking.bookingId);

                                        return (
                                            <tr key={`${booking.bookingId}-${index}`} className="border-b border-gray-200 hover:bg-gray-100">
                                                <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                                    {booking.bookingId}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    <div className="font-medium max-w-xs">
                                                        <div className="truncate" title={booking.hotelName}>
                                                            {booking.hotelName}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            <div>Code: {booking.hotelCode}</div>
                                                            <div>City: {booking.city}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {formatDate(booking.checkInDate)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {formatDate(booking.checkOutDate)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                    {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    <div>
                                                        <div>{booking.numberOfRooms} room{booking.numberOfRooms !== '1' ? 's' : ''}</div>
                                                        <div className="text-xs text-gray-500">{booking.numberOfGuests} guest{booking.numberOfGuests !== '1' ? 's' : ''}</div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-sm text-gray-600 w-20">
                                                    <div className="truncate text-xs" title={booking.roomType}>
                                                        {booking.roomType}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                                    {booking.confirmationNo}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                                                        {booking.bookingStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {formatAmount(booking.totalAmount)}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                                        {booking.paymentStatus}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{booking.createdAt}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex flex-col space-y-1">
                                                        {/* Download Invoice Button */}
                                                        {/* <button
                                                            onClick={() => handleInvoiceDownload(booking)}
                                                            disabled={isDownloadingInvoice || !booking.searchTokenId}
                                                            className={`px-3 py-1 rounded text-white text-xs ${!booking.searchTokenId
                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                : isDownloadingInvoice
                                                                    ? "bg-orange-500 cursor-wait"
                                                                    : "bg-red-500 hover:bg-red-600"
                                                                }`}
                                                            title={!booking.searchTokenId ? "Invoice not available" : "Download Invoice"}
                                                        >
                                                            {isDownloadingInvoice ? "Downloading..." : "Invoice"}
                                                        </button> */}

                                                        <button
                                                            onClick={() => handleDownloadInvoiceForBooking(booking)}
                                                            disabled={isDownloadingInvoice}
                                                            className={`px-3 py-1 rounded text-white text-xs ${isDownloadingInvoice
                                                                    ? "bg-orange-500 cursor-wait"
                                                                    : "bg-red-500 hover:bg-red-600"
                                                                }`}
                                                            title="Download Invoice"
                                                        >
                                                            {isDownloadingInvoice ? "Downloading..." : "Download Invoice"}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {/* Status Button */}
                                                    <button
                                                        onClick={() => handleOpenStatusModal(booking)}
                                                        className="text-xs text-green-500 hover:text-green-700"
                                                        title="View Detailed Status"
                                                    >
                                                        Status
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalBookings}
                    onPageChange={goToPage}
                    onPrevious={goToPrevPage}
                    onNext={goToNextPage}
                />
            </div>

            {/* Status Modal */}
            {statusModalOpen && (
                <StatusModal
                    booking={selectedBookingForStatus}
                    statusData={realTimeStatuses[selectedBookingForStatus?.bookingId]}
                    isLoading={statusModalLoading}
                    onClose={handleCloseStatusModal}
                />
            )}
        </>
    );
};

export default HotelBookingHistory;