import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import html2pdf from "html2pdf.js";

// Barcode generation function
const generateBarcode = (text, canvas) => {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = 300;
  const height = 50;
  
  canvas.width = width;
  canvas.height = height;
  
  // Clear canvas
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  
  // Convert text to binary pattern
  let binary = '';
  for (let i = 0; i < text?.length; i++) {
    binary += text.charCodeAt(i).toString(2).padStart(8, '0');
  }
  
  // Draw barcode
  const barWidth = width / binary?.length;
  ctx.fillStyle = 'black';
  
  for (let i = 0; i < binary?.length; i++) {
    if (binary[i] === '1') {
      ctx.fillRect(i * barWidth, 0, barWidth, height);
    }
  }
};

// QR Code generation function (simple pattern)
const generateQRPattern = () => {
  const patterns = [
    '█ █ █ █ █ █ █',
    ' █ █ █ █ █ █ ',
    '█ █ █ █ █ █ █',
    ' █ █ █ █ █ █ ',
    '█ █ █ █ █ █ █',
    ' █ █ █ █ █ █ ',
    '█ █ █ █ █ █ █'
  ];
  return patterns;
};

// Generate booking reference barcode data
const generateBarcodeData = (bookingData) => {
  const result = bookingData;
  const passenger = result.passenger[0];
  const segment = result.segments[0][0];
  
  // Create barcode string with flight info
  return `${result.PNR}${segment.Airline.AirlineCode}${segment.Airline.FlightNumber}${passenger.LastName.substring(0,3).toUpperCase()}${result.BookingId}`;
};

// PDF Print functionality



const downloadPDF = () => {
  const element = document.getElementById("flight-ticket");

  const options = {
    margin: .912,
    filename: `Flight-Ticket.pdf`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 4, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }  // ensures table splits properly
  };

  html2pdf().set(options).from(element).save();
};


const FlightETicket = () => {


    const location = useLocation();
  const canvasRef = useRef(null);
  const { Jtype, invoice } = location.state || {};

  console.log("E-Ticket Data:", invoice);
  console.log("E-Ticket Data:", invoice);


  
  // Your flight booking data
  const bookingData =invoice

  // Extract data for easier access
  const result= bookingData;
  const passenger = invoice.passenger[0];
  const segment = invoice.segments[0][0];
  const fare = invoice.fareDetails;

  // Format dates

  const printToPDF = () => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Get the ticket content
  const ticketContent = document.getElementById('flight-ticket').innerHTML;
  
  // Get barcode image data
  const canvas = document.querySelector('canvas');
  const barcodeDataURL = canvas ? canvas.toDataURL() : '';
  
  // Create HTML for print with proper styling
  const printHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Flight E-Ticket - ${document.querySelector('[data-passenger-name]')?.textContent || 'Passenger'}</title>
      <meta charset="UTF-8">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        @media print {
          body { margin: 0; padding: 20px; font-size: 12px; }
          .no-print { display: none !important; }
          .card { box-shadow: none; border: 1px solid #ddd; }
          .page-break { page-break-before: always; }
        }
        body { font-family: Arial, sans-serif; }
        .ticket-container { max-width: 800px; margin: 0 auto; }
        .barcode-canvas { display: block !important; }
      </style>
    </head>
    <body>
      <div class="ticket-container">
        ${ticketContent}
      </div>
      <script>
        // Replace canvas with image for print
        const canvas = document.querySelector('canvas');
        if (canvas && '${barcodeDataURL}') {
          const img = document.createElement('img');
          img.src = '${barcodeDataURL}';
          img.style.maxWidth = '100%';
          img.style.height = '50px';
          img.style.border = '1px solid #ddd';
          img.style.borderRadius = '4px';
          canvas.parentNode.replaceChild(img, canvas);
        }
        
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          }
        }
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(printHTML);
  printWindow.document.close();
};
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: '2-digit' 
    }).toUpperCase();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  // Calculate duration in hours and minutes
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getAirlineName = () => {
    return  segment.Airline.AirlineName;
  };

  // Generate dynamic barcode data
  const barcodeData = generateBarcodeData(bookingData);
  const qrPattern = generateQRPattern();
  
  // Generate barcode on component mount
    useEffect(() => {
  // Generate barcode
  if (canvasRef.current) {
    generateBarcode(barcodeData, canvasRef.current);
  }

  // Automatically open print dialog after a small delay
  const timer = setTimeout(() => {
    printToPDF()
  }, 500); // 500ms delay to ensure page renders

  return () => clearTimeout(timer); // cleanup
}, [barcodeData]);

  return (
    <div className="min-vh-100 bg-light py-4">
      {/* Print/Download Buttons */}
      <div className="container mb-3 no-print">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="d-flex justify-content-end gap-2">
              <button 
                className="btn btn-primary print-btn"
                onClick={printToPDF}
                style={{ backgroundColor: '#c41e3a', borderColor: '#c41e3a' }}
              >
                🖨️ Print Ticket
              </button>

 <button 
                className="btn btn-primary print-btn"
                onClick={downloadPDF}
                style={{ backgroundColor: '#c41e3a', borderColor: '#c41e3a' }}
              >
                🖨️ Download Ticket
              </button>

              
            </div>
          </div>
        </div>
      </div>
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card shadow-sm" id="flight-ticket"
                 data-passenger-name={`${passenger.FirstName} ${passenger.LastName}`}
                 data-pnr={result.PNR}>
              {/* Header Section */}
              <div className="card-header bg-white p-4" style={{ borderBottom: '3px solid #c41e3a' }}>
                <div className="row align-items-center">
                  <div className="col-6">
                    <div style={{ color: '#c41e3a' }}>
                      <div style={{ fontSize: '25px', marginBottom: '25px',fontWeight: 'bold' }}> ✈️ {getAirlineName()}</div>
                      {/* <div style={{ fontSize: '36px', fontWeight: 'bold' }}>✈️{getAirlineName()}</div> */}
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px', lineHeight: '1.4' }}>
                      Scan the barcode above or use the e-ticket<br />
                      number below for self service kiosk check-in
                    </div>
                    <div className="text-center">
                      {/* Dynamic Barcode Canvas */}
                      <canvas 
                        ref={canvasRef}
                        style={{ 
                          maxWidth: '100%',
                          height: '50px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: 'white'
                        }}
                      />
                      <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px' }}>
                        {barcodeData}
                      </div>
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '5px' }}>
                        Booking Reference: {result.PNR}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-12">
                    <h2 style={{ fontSize: '32px', fontWeight: 'normal', color: '#333', margin: 0 }}>
                      e-Ticket Receipt & Itinerary
                    </h2>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="card-body p-4" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                <div className="mb-3">
                  Your electronic ticket is stored in our computer reservation system. This e-Ticket receipt / itinerary is your record of your electronic ticket 
                  and forms part of your contract of carriage. You may need to show this receipt to enter the airport and/or to prove return or onward 
                  travel to customs and immigration officials.
                </div>

                <div className="mb-3">
                  Economy Class passengers should report to airline check-in desks 2 hours prior to departure of domestic flights. 
                  Boarding for your flight begins at least 45 minutes before your scheduled departure time. Gates close 15 minutes prior to departure.
                </div>

                <div className="fw-bold mb-3">
                  Please check with departure airport for restrictions on the carriage of liquids, aerosols and gels in hand baggage.
                </div>

                <div className="mb-4">
                  Below are the details of your electronic ticket. Note: all timings are local.
                </div>

                {/* Flight Route Display */}
                <div className="row text-center mb-4 py-4" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <div className="col-4">
                    <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#1e3c72' }}>{segment.Origin.AirportCode}</div>
                    <div style={{ fontSize: '16px', color: '#666' }}>{segment.Origin.CityName}</div>
                    <div style={{ fontSize: '14px', color: '#888' }}>{segment.Origin.AirportName}</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}>{formatTime(segment.Origin.DepartTime)}</div>
                  </div>
                  <div className="col-4 d-flex flex-column justify-content-center">
                    <div style={{ fontSize: '24px', color: '#1e3c72', marginBottom: '10px' }}>✈</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>{formatDuration(segment.Duration)}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Direct Flight</div>
                  </div>
                  <div className="col-4">
                    <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#1e3c72' }}>{segment.Destination.AirportCode}</div>
                    <div style={{ fontSize: '16px', color: '#666' }}>{segment.Destination.CityName}</div>
                    <div style={{ fontSize: '14px', color: '#888' }}>{segment.Destination.AirportName}</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}>{formatTime(segment.Destination.ArrivalTime)}</div>
                  </div>
                </div>

                {/* Passenger and Ticket Information */}
                <div 
                  className="text-white fw-bold py-2 px-3 mb-0"
                  style={{ backgroundColor: '#b0b0b0', fontSize: '14px' }}
                >
                  PASSENGER AND TICKET INFORMATION
                </div>
                
                <div className="table-responsive">
                  <table className="table table-sm mb-4" style={{ fontSize: '12px' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #ddd' }}>
                        <td className="fw-bold" style={{ width: '180px', padding: '8px 15px' }}>PASSENGER NAME</td>
                        <td style={{ padding: '8px 15px' }}>{passenger.Title} {passenger.FirstName} {passenger.LastName}</td>
                        <td className="fw-bold" style={{ width: '180px', padding: '8px 15px' }}>CONTACT</td>
                        <td style={{ padding: '8px 15px' }}>{passenger.ContactNo}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #ddd' }}>
                        <td className="fw-bold" style={{ padding: '8px 15px' }}>BOOKING REFERENCE</td>
                        <td style={{ padding: '8px 15px' }}>{result.PNR}</td>
                        <td className="fw-bold" style={{ padding: '8px 15px' }}>INVOICE NO</td>
                        <td style={{ padding: '8px 15px' }}>{result.invoiceNumber}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #ddd' }}>
                        <td className="fw-bold" style={{ padding: '8px 15px' }}>EMAIL</td>
                        <td style={{ padding: '8px 15px' }}>{passenger.Email}</td>
                        <td className="fw-bold" style={{ padding: '8px 15px' }}>BOOKING DATE</td>
                        <td style={{ padding: '8px 15px' }}>{formatDate(result.invoiceDate)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Travel Information */}
                <div 
                  className="text-white fw-bold py-2 px-3 mb-0"
                  style={{ backgroundColor: '#b0b0b0', fontSize: '14px' }}
                >
                  TRAVEL INFORMATION
                </div>

                <div className="table-responsive">
                  <table className="table table-sm mb-4" style={{ fontSize: '11px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <th className="fw-bold" style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>FLIGHT</th>
                        <th className="fw-bold" style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>DATE/TIME</th>
                        <th className="fw-bold" style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>AIRPORT/TERMINAL</th>
                        <th className="fw-bold" style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>CLASS</th>
                        <th className="fw-bold" style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>SEAT</th>
                        <th className="fw-bold" style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '2px solid #333' }}>
                        <td style={{ padding: '8px', verticalAlign: 'top' }}>
                          <strong>{segment.Airline.AirlineCode}-{segment.Airline.FlightNumber}</strong><br />
                          <span className="fw-bold text-success">CONFIRMED</span>
                        </td>
                        <td style={{ padding: '8px', verticalAlign: 'top' }}>
                          <strong>Departure:</strong><br />
                          {formatDate(segment.Origin.DepartTime)}<br />
                          {formatTime(segment.Origin.DepartTime)}<br /><br />
                          <strong>Arrival:</strong><br />
                          {formatDate(segment.Destination.ArrivalTime)}<br />
                          {formatTime(segment.Destination.ArrivalTime)}
                        </td>
                        <td style={{ padding: '8px', verticalAlign: 'top' }}>
                          <strong>From:</strong><br />
                          {segment.Origin.AirportName} ({segment.Origin.AirportCode})<br />
                          Terminal {segment.Origin.Terminal}<br /><br />
                          <strong>To:</strong><br />
                          {segment.Destination.AirportName} ({segment.Destination.AirportCode})<br />
                          Terminal {segment.Destination.Terminal}
                        </td>
                        <td style={{ padding: '8px', verticalAlign: 'top' }}>
                          <strong>{segment.CabinClass}</strong><br />
                          Fare: {segment.Airline.FareClass}<br /><br />
                          <strong>Baggage:</strong><br />
                          Cabin: {segment.CabinBaggage}<br />
                          {passenger.Baggage?.length > 0 && `Extra: ${passenger.Baggage[0].Weight}kg`}
                        </td>
                        <td style={{ padding: '8px', verticalAlign: 'top' }}>
                          {passenger.Seat?.length > 0 ? (
                            <>
                              <strong>{passenger.Seat[0].SeatNo}</strong><br />
                              Row {passenger.Seat[0].RowNo}<br />
                              Aircraft: {segment.Craft}
                            </>
                          ) : (
                            'To be assigned'
                          )}
                        </td>
                        <td style={{ padding: '8px', verticalAlign: 'top' }}>
                          <span className="badge bg-success">CONFIRMED</span><br />
                          {result.IsRefundable && <small className="text-success">Refundable</small>}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Fare and Additional Information */}
                <div 
                  className="text-white fw-bold py-2 px-3 mb-0"
                  style={{ backgroundColor: '#b0b0b0', fontSize: '14px' }}
                >
                  FARE AND ADDITIONAL INFORMATION
                </div>

                <div className="table-responsive">
                  <table className="table table-sm mb-3" style={{ fontSize: '12px' }}>
                    <tbody>
                      <tr>
                        <td className="fw-bold" style={{ padding: '5px 15px', width: '200px' }}>BASE FARE</td>
                        <td className="text-end fw-bold" style={{ padding: '5px 15px', width: '150px' }}>₹{fare.baseFare}</td>
                        <td style={{ paddingLeft: '30px', padding: '5px 15px' }}>
                          <strong>ADDITIONAL SERVICES</strong>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold" style={{ padding: '5px 15px' }}>TAXES & FEES</td>
                        <td className="text-end fw-bold" style={{ padding: '5px 15px' }}>₹{result.vendorCommission}</td>
                        <td style={{ paddingLeft: '30px', padding: '5px 15px' }}>
                          {fare.baggageCharges > 0 && `Extra Baggage: ₹${fare.baggageCharges}`}<br />
                          {fare.seatCharges > 0 && `Seat Selection: ₹${fare.seatCharges}`} <br/>
                          {fare.mealCharges > 0 && `Seat Selection: ₹${fare.mealCharges}`}

                        </td>
                      </tr>
                      {fare.TotalBaggageCharges > 0 && (
                        <tr>
                          <td className="fw-bold" style={{ padding: '5px 15px' }}>BAGGAGE CHARGES</td>
                          <td className="text-end fw-bold" style={{ padding: '5px 15px' }}>₹{fare.baggageCharges}</td>
                          <td style={{ padding: '5px 15px' }}></td>
                        </tr>
                      )}
                      {fare.TotalSeatCharges > 0 && (
                        <tr>
                          <td className="fw-bold" style={{ padding: '5px 15px' }}>SEAT CHARGES</td>
                          <td className="text-end fw-bold" style={{ padding: '5px 15px' }}>₹{fare.seatCharges}</td>
                          <td style={{ padding: '5px 15px' }}></td>
                        </tr>
                      )}
                      <tr style={{ borderTop: '2px solid #333' }}>
                        <td className="fw-bold" style={{ padding: '5px 15px', fontSize: '16px' }}>TOTAL AMOUNT</td>
                        <td colSpan={2} className="text-end fw-bold" style={{ padding: '5px 15px', fontSize: '16px', color: '#c41e3a' }}>₹{result.netPayableAmount} <span style={{  fontSize: '10px',}} >( {result.invoiceTotalInWords} )</span> </td>
                        <td style={{ padding: '5px 15px' }}></td>
                      </tr>
                      <tr>
                        <td className="fw-bold" style={{ padding: '5px 15px' }}>PAYMENT STATUS</td>
                        <td className="text-end fw-bold text-success" style={{ padding: '5px 15px' }}>CONFIRMED</td>
                        <td style={{ padding: '5px 15px' }}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="row mt-4">
                  <div className="col-md-6">
                    <div className="alert alert-info">
                      <h6 className="fw-bold">Check-in Information:</h6>
                      <small>
                        • Web check-in opens 48 hours before departure<br />
                        • Airport check-in: 2 hours before domestic flights<br />
                        • Gate closes 15 minutes before departure
                      </small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="alert alert-warning">
                      <h6 className="fw-bold">Important Notes:</h6>
                      <small>
                        • Carry valid photo ID for check-in<br />
                        • Arrive at gate 45 minutes before departure<br />
                        • Check airline website for latest guidelines
                      </small>
                    </div>
                  </div>
                  
                </div>
              </div>

              {/* Footer */}
              <div 
                className="card-footer bg-white d-flex justify-content-between align-items-center"
                style={{ fontSize: '10px', color: '#666', borderTop: '1px solid #ddd' }}
              >
                <div className="d-flex align-items-center">
                  <span style={{ fontSize: '14px', marginRight: '5px' }}>©</span>
                  <span>2025 {getAirlineName()}. All rights reserved. | Booking ID: {result.BookingId}</span>
                </div>
                <div className="fw-bold">Page 1 of 1</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body { margin: 0 !important; padding: 15px !important; }
          .no-print { display: none !important; }
          .bg-light { background: white !important; }
          .card { box-shadow: none !important; border: 1px solid #ddd !important; }
          .min-vh-100 { min-height: auto !important; }
          .py-4 { padding-top: 0 !important; padding-bottom: 0 !important; }
          .alert { border: 1px solid #ddd !important; }
          .badge { border: 1px solid #333 !important; }
          canvas { display: block !important; }
        }
        
        @page {
          margin: 1cm;
          size: A4;
        }
      `}</style>
    </div>
  );
};

export default FlightETicket;