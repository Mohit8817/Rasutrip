import React, { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';

const BusInvoice = ({ invoiceData, onClose }) => {
    const printRef = useRef();

    const handlePrint = () => {
        const printContent = printRef.current;
        const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        winPrint.document.write(`
            <html>
                <head>
                    <title>Bus Invoice</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .invoice-container { max-width: 700px; margin: auto; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                        th { background-color: #f8f9fa; }
                        .header-table td { border: none; padding: 10px; }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .fw-bold { font-weight: bold; }
                        .mb-3 { margin-bottom: 1rem; }
                        .mb-4 { margin-bottom: 1.5rem; }
                        .bg-light { background-color: #f8f9fa; }
                        ul { padding-left: 20px; }
                        li { margin-bottom: 5px; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        winPrint.document.close();
        winPrint.focus();
        winPrint.print();
        winPrint.close();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN');
    };

    if (!invoiceData) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b no-print">
                    <h2 className="text-xl font-bold">Bus Booking Invoice</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    <div ref={printRef} className="max-w-4xl mx-auto">
                        {/* Invoice Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold">Tax Invoice (Bus Booking)</h2>
                        </div>

                        {/* Supplier and Receiver Details */}
                        <div className="mb-6">
                            <table className="w-full border-collapse">
                                <tbody>
                                    <tr>
                                        <td className="w-1/2 align-top p-4 border">
                                            <strong>From:</strong> {invoiceData.supplierDetails?.name || 'RasuTrip'}<br />
                                            <strong>Mobile:</strong> {invoiceData.supplierDetails?.mobile || 'N/A'}<br />
                                            <strong>Email:</strong> {invoiceData.supplierDetails?.email || 'support@rasutrip.com'}<br />
                                            <strong>PAN Number:</strong> {invoiceData.supplierDetails?.pan || 'N/A'}<br />
                                            <strong>State:</strong> {invoiceData.supplierDetails?.state || 'Delhi'}<br />
                                            <strong>Company Registered No.:</strong> {invoiceData.supplierDetails?.companyRegisteredNumber || 'N/A'}
                                        </td>
                                        <td className="w-1/2 align-top p-4 border text-right">
                                            <strong>Passenger Name:</strong> {invoiceData.receiverDetails?.name || 'N/A'}<br />
                                            <strong>Phone:</strong> {invoiceData.receiverDetails?.phone || 'N/A'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Invoice Details */}
                        <div className="mb-6">
                            <table className="w-full border-collapse border">
                                <tbody>
                                    <tr>
                                        <td className="p-3 border font-semibold">Invoice Number:</td>
                                        <td className="p-3 border">{invoiceData.invoiceId || invoiceData.invoiceNumber || 'N/A'}</td>
                                        <td className="p-3 border font-semibold">Invoice Date:</td>
                                        <td className="p-3 border">{formatDate(invoiceData.invoiceDate)}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 border font-semibold">Booking ID:</td>
                                        <td className="p-3 border">{invoiceData.bookingId || 'N/A'}</td>
                                        <td className="p-3 border font-semibold">Ticket No:</td>
                                        <td className="p-3 border">{invoiceData.TicketNo || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 border font-semibold">From:</td>
                                        <td className="p-3 border">{invoiceData.source || 'N/A'}</td>
                                        <td className="p-3 border font-semibold">To:</td>
                                        <td className="p-3 border">{invoiceData.destination || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 border font-semibold">Departure:</td>
                                        <td className="p-3 border">{formatDateTime(invoiceData.departureTime)}</td>
                                        <td className="p-3 border font-semibold">Arrival:</td>
                                        <td className="p-3 border">{formatDateTime(invoiceData.arrivalTime)}</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 border font-semibold" colSpan="2">Bus Type:</td>
                                        <td className="p-3 border" colSpan="2">{invoiceData.busType || 'N/A'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Passenger Details */}
                        <h4 className="text-lg font-semibold mb-3">PASSENGER DETAILS</h4>
                        <div className="mb-6">
                            <table className="w-full border-collapse border">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 border text-left">Ticket No</th>
                                        <th className="p-3 border text-left">Route</th>
                                        <th className="p-3 border text-left">Passenger Name</th>
                                        <th className="p-3 border text-left">Age</th>
                                        <th className="p-3 border text-left">Seat No</th>
                                        <th className="p-3 border text-left">Fare (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceData.passenger && invoiceData.passenger.length > 0 ? (
                                        invoiceData.passenger.map((passenger, index) => (
                                            <tr key={index}>
                                                <td className="p-3 border">{invoiceData.TicketNo || 'N/A'}</td>
                                                <td className="p-3 border">{`${invoiceData.source || ''} - ${invoiceData.destination || ''}`}</td>
                                                <td className="p-3 border">{`${passenger.Title || ''} ${passenger.FirstName || ''} ${passenger.LastName || ''}`}</td>
                                                <td className="p-3 border">{passenger.Age || 'N/A'}</td>
                                                <td className="p-3 border">{passenger.SeatName || 'N/A'}</td>
                                                <td className="p-3 border">₹ {passenger.Seat?.SeatFare || '0'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-3 border text-center">No passenger details available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Payment Details */}
                        <h4 className="text-lg font-semibold mb-3">PAYMENT DETAILS</h4>
                        <div className="mb-6">
                            <table className="w-full">
                                <tbody>
                                    <tr>
                                        <td className="py-2 w-3/4 font-semibold">No. of Seats:</td>
                                        <td className="py-2">{invoiceData.fareDetails?.NoOfSeats || invoiceData.passenger?.length || '1'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-semibold">Base Fare:</td>
                                        <td className="py-2">₹ {invoiceData.fareDetails?.baseFare || '0'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-semibold">Taxes:</td>
                                        <td className="py-2">₹ {invoiceData.fareDetails?.taxes || '0'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-semibold">Service Charges:</td>
                                        <td className="py-2">₹ {invoiceData.fareDetails?.serviceCharges || '0'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-semibold">Platform Fee:</td>
                                        <td className="py-2">₹ {invoiceData.vendorCommission || '0'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-semibold">Coupon Discount (-):</td>
                                        <td className="py-2">₹ {invoiceData.fareDetails?.couponDiscount || '0'}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-semibold">IGST Rate:</td>
                                        <td className="py-2">{invoiceData.fareDetails?.IGSTRate || '0'}%</td>
                                    </tr>
                                    <tr className="font-bold text-lg border-t-2 border-gray-300">
                                        <td className="py-3 font-bold">Total Payable:</td>
                                        <td className="py-3 font-bold">₹ {invoiceData.totalPayable || invoiceData.invoiceTotal || '0'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Boarding & Dropping Details */}
                        {(invoiceData.boardingPointdetails || invoiceData.droppingPointdetails) && (
                            <>
                                <h4 className="text-lg font-semibold mb-3">BOARDING & DROPPING DETAILS</h4>
                                <div className="mb-6">
                                    <table className="w-full border-collapse border">
                                        <tbody>
                                            <tr>
                                                <td className="w-1/2 align-top p-4 border">
                                                    <strong>Boarding:</strong><br />
                                                    {invoiceData.boardingPointdetails && (
                                                        <>
                                                            {invoiceData.boardingPointdetails.CityPointName}, {invoiceData.boardingPointdetails.CityPointLocation}<br />
                                                            <strong>Landmark:</strong> {invoiceData.boardingPointdetails.CityPointLandmark}<br />
                                                            <strong>Time:</strong> {formatDateTime(invoiceData.boardingPointdetails.CityPointTime)}<br />
                                                            <strong>Contact:</strong> {invoiceData.boardingPointdetails.CityPointContactNumber}
                                                        </>
                                                    )}
                                                </td>
                                                <td className="w-1/2 align-top p-4 border">
                                                    <strong>Dropping:</strong><br />
                                                    {invoiceData.droppingPointdetails && invoiceData.droppingPointdetails[0] && (
                                                        <>
                                                            {invoiceData.droppingPointdetails[0].CityPointName}, {invoiceData.droppingPointdetails[0].CityPointLocation}<br />
                                                            <strong>Time:</strong> {formatDateTime(invoiceData.droppingPointdetails[0].CityPointTime)}
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* Terms & Conditions */}
                        <h4 className="text-lg font-semibold mb-3">TERMS & CONDITIONS</h4>
                        <ul className="text-sm pl-5 space-y-1">
                            <li>This is a computer-generated invoice; no signature required.</li>
                            <li>All disputes are subject to jurisdiction of New Delhi.</li>
                            <li>Please report at the boarding point at least 30 minutes before departure.</li>
                            <li>Ensure correct contact number for updates on schedule or cancellation.</li>
                            <li>Refunds & Cancellations are subject to operator approval.</li>
                            <li>Kindly check all details carefully to avoid unnecessary complications.</li>
                        </ul>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 p-4 border-t no-print">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <X size={16} />
                        Close
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Printer size={16} />
                        Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusInvoice;