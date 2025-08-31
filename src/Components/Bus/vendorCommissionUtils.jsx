// src/utils/vendorCommissionUtils.js

/**
 * Calculate vendor commission amount from base price and percentage
 * @param {number} basePrice - The base price before commission
 * @param {number} commissionPercentage - Commission percentage (e.g., 11 for 11%)
 * @returns {number} - Commission amount
 */
export const calculateVendorCommission = (basePrice, commissionPercentage) => {
  if (!basePrice || !commissionPercentage) return 0;
  return (basePrice * commissionPercentage) / 100;
};

/**
 * Calculate total price including vendor commission
 * @param {number} basePrice - The base price before commission
 * @param {number} commissionPercentage - Commission percentage (e.g., 11 for 11%)
 * @returns {object} - Object containing breakdown
 */
export const calculatePriceWithCommission = (basePrice, commissionPercentage) => {
  const commissionAmount = calculateVendorCommission(basePrice, commissionPercentage);
  const totalPrice = basePrice + commissionAmount;
  
  return {
    basePrice,
    commissionAmount,
    commissionPercentage,
    totalPrice
  };
};

/**
 * Calculate fare summary for multiple seats/passengers
 * @param {Array} passengers - Array of passenger objects with seat price info
 * @param {number} vendorCommissionPercentage - Commission percentage from API
 * @param {object} additionalCharges - Object with taxes, gst, etc.
 * @returns {object} - Complete fare breakdown
 */
export const calculateMultiSeatFareSummary = (
  passengers, 
  vendorCommissionPercentage = 0, 
  additionalCharges = {}
) => {
  let totalBasePrice = 0;
  let totalCommission = 0;

  // Calculate totals from passenger seat prices
  passengers.forEach(passenger => {
    const seatPrice = passenger.Seat?.Price?.PublishedPrice || passenger.seatPrice || 0;
    totalBasePrice += seatPrice;
    totalCommission += calculateVendorCommission(seatPrice, vendorCommissionPercentage);
  });

  const {
    taxes = 0,
    otherCharges = 0,
    gst = 0,
    discount = 0
  } = additionalCharges;

  const totalAmount = totalBasePrice + totalCommission + taxes + otherCharges + gst - discount;

  return {
    basePrice: totalBasePrice,
    vendorCommissionAmount: totalCommission,
    vendorCommissionPercentage,
    taxes,
    otherCharges,
    gst,
    discount,
    totalAmount,
    numberOfSeats: passengers.length
  };
};

/**
 * Extract vendor commission percentage from bus API response
 * @param {object} busData - Bus data from search API
 * @returns {number} - Commission percentage
 */
export const extractCommissionPercentage = (busData) => {
  return busData?.BusPrice?.rasutripCommissionPercentage || 
         busData?.rasutripCommissionPercentage || 
         0;
};

/**
 * Format fare summary for display purposes
 * @param {object} fareSummary - Fare summary object
 * @returns {object} - Formatted fare summary with currency symbols
 */
export const formatFareSummary = (fareSummary) => {
  const formatCurrency = (amount) => `₹ ${amount.toFixed(2)}`;
  
  return {
    ...fareSummary,
    formattedBasePrice: formatCurrency(fareSummary.basePrice),
    formattedCommissionAmount: formatCurrency(fareSummary.vendorCommissionAmount),
    formattedTaxes: formatCurrency(fareSummary.taxes),
    formattedOtherCharges: formatCurrency(fareSummary.otherCharges),
    formattedGst: formatCurrency(fareSummary.gst),
    formattedDiscount: formatCurrency(fareSummary.discount),
    formattedTotalAmount: formatCurrency(fareSummary.totalAmount)
  };
};

/**
 * Calculate fare breakdown from block seat API response
 * @param {object} blockSeatResponse - Response from block seat API
 * @param {number} originalCommissionPercentage - Original commission percentage from search
 * @returns {object} - Fare breakdown
 */
export const calculateFareFromBlockSeatResponse = (blockSeatResponse, originalCommissionPercentage = 0) => {
  if (!blockSeatResponse?.Result?.Passenger) {
    return null;
  }

  const passengers = blockSeatResponse.Result.Passenger;
  let totalBasePrice = 0;
  let totalTaxes = 0;
  let totalOtherCharges = 0;
  let totalGst = 0;

  passengers.forEach(passenger => {
    const seatPrice = passenger.Seat?.Price;
    if (seatPrice) {
      totalBasePrice += seatPrice.PublishedPrice || 0;
      totalTaxes += seatPrice.Tax || 0;
      totalOtherCharges += seatPrice.OtherCharges || 0;
      
      // Calculate GST total
      const gstData = seatPrice.GST || {};
      totalGst += (gstData.CGSTAmount || 0) + (gstData.SGSTAmount || 0) + (gstData.IGSTAmount || 0);
    }
  });

  const vendorCommissionAmount = calculateVendorCommission(totalBasePrice, originalCommissionPercentage);
  const totalAmount = totalBasePrice + vendorCommissionAmount + totalTaxes + totalOtherCharges + totalGst;

  return {
    basePrice: totalBasePrice,
    vendorCommissionAmount,
    vendorCommissionPercentage: originalCommissionPercentage,
    taxes: totalTaxes,
    otherCharges: totalOtherCharges,
    gst: totalGst,
    discount: 0,
    totalAmount,
    numberOfSeats: passengers.length,
    passengerBreakdown: passengers.map(p => ({
      seatName: p.Seat?.SeatName,
      price: p.Seat?.Price?.PublishedPrice || 0,
      commission: calculateVendorCommission(p.Seat?.Price?.PublishedPrice || 0, originalCommissionPercentage)
    }))
  };
};