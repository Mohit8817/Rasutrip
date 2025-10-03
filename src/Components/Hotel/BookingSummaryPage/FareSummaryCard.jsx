import React from "react";
import { Card } from "react-bootstrap";

const FareSummaryCard = ({
  priceDetails,
  blockedRoomData,
  appliedCoupon = null,
  couponDiscount = 0,
}) => {
  // Get data from blocked room response
  const roomData = blockedRoomData?.HotelRoomsDetails?.[0] || {};
  const priceData = roomData?.Price || {};
  console.log("🏷️ FareSummary - blockedRoomData:", blockedRoomData);
  console.log("🏷️ FareSummary - priceData:", priceData);
  console.log("🏷️ FareSummary - priceDetails:", priceDetails);

  // ✅ Extract prices from blocked room API response
  const finalRoomPrice = priceData.RoomPrice || 0;
  const finalPublishedPrice =
    priceData.PublishedPrice || priceDetails?.baseFare || 0;
  const finalTax = priceData.Tax || priceDetails?.tax || 0;
  const finalDiscount = priceData.Discount || priceDetails?.discount || 0;
  const finalServiceCharges =
    priceData.ServiceCharges || priceDetails?.serviceCharges || 0;
  const finalOtherCharges =
    priceData.OtherCharges || priceDetails?.otherCharges || 0;
  const agentCommission = priceData.AgentCommission || 0;
  const tds = priceData.TDS || 0;

  const actualBaseFare = finalPublishedPrice;

  // Calculate vendor commission if not available from API
  const vendorCommissionPercentage = priceDetails?.vendorCommissionPercentage || 12;
  const vendorCommissionAmount = agentCommission || (actualBaseFare * vendorCommissionPercentage) / 100;

  // Calculate total GST
  let totalGST = cgstAmount + sgstAmount + igstAmount;
  if (totalGST === 0 && (cgstRate > 0 || sgstRate > 0 || igstRate > 0)) {
    const gstBase = actualBaseFare + vendorCommissionAmount;
    totalGST = (gstBase * (cgstRate + sgstRate + igstRate)) / 100;
  }

  // ✅ CORRECTED: New calculation logic matching the payment component
  // STEP 1: Calculate subtotal with all charges BEFORE any discounts
  const subtotalBeforeDiscounts = actualBaseFare + finalTax + vendorCommissionAmount + finalServiceCharges + finalOtherCharges + totalGST + tds;

  // STEP 2: Apply hotel discount first (if any)  
  const subtotalAfterHotelDiscount = subtotalBeforeDiscounts - finalDiscount;
  const finalCouponDiscount = couponDiscount || 0;
  const finalAmountAfterCoupon = Math.max(
    0,
    subtotalAfterHotelDiscount - finalCouponDiscount
  );

  // Final Total = Base Fare + Convenience Fee
  const roundedTotal = parseFloat(
    (actualBaseFare + rasuTripCommissionAmount).toFixed(2)
  );

  console.log("💰 FareSummary Price Breakdown:", {
    actualBaseFare,
    rasuTripCommissionAmount,
    roundedTotal,
  });

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Header className="bg-light fw-bold">Fare Summary</Card.Header>
      <Card.Body className="p-3">
        {/* Base Fare */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Base Fare</span>
          <span>₹ {actualBaseFare.toLocaleString()}</span>
        </div>

        {/* Taxes */}
        {finalTax > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>Taxes</span>
            <span>₹ {finalTax.toFixed(2)}</span>
          </div>
        )}

        {/* Service Charges */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Service Charges</span>
          <span>₹ {finalServiceCharges.toFixed(2)}</span>
        </div>

        {/* Other Charges */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Other Charges</span>
          <span>₹ {finalOtherCharges.toFixed(2)}</span>
        </div>

        {/* ✅ Convenience Fee (RasuTrip Commission) */}
        {/* {rasuTripCommissionAmount > 0 && ( */}
        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
          <span>Convenience Fee</span>
          <span>₹ {rasuTripCommissionAmount.toFixed(2)}</span>
        </div>
        {/* )} */}

        {/* GST */}
        {gstPercentage > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <span>GST</span>
            <span>{gstPercentage}%</span>
          </div>
        )}

        {/* Hotel Discount */}
        {finalDiscount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-success">
            <span>Hotel Discount (-)</span>
            <span>- ₹ {finalDiscount.toFixed(2)}</span>
          </div>
        )}

        {/* Coupon Discount */}
        {finalCouponDiscount > 0 && (
          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
            <div>
              <span className="text-success fw-bold">
                <i className="bi bi-tag-fill me-2"></i>
                Coupon Discount (-)
              </span>
              {appliedCoupon && (
                <div>
                  <small className="text-muted d-block">
                    Code:{" "}
                    <span className="fw-bold">
                      {appliedCoupon.code || appliedCoupon.couponCode}
                    </span>
                  </small>
                  {(appliedCoupon.discountType === "percentage" ||
                    appliedCoupon.type === "PERCENTAGE") && (
                    <small className="text-muted d-block">
                      {appliedCoupon.discount || appliedCoupon.value}% off
                    </small>
                  )}
                </div>
              )}
            </div>
            <span className="text-success fw-bold">
              - ₹ {finalCouponDiscount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Total Payable */}
        <div className="d-flex justify-content-between pt-3 mt-3 border-top">
          <span className="fs-5 fw-semibold">Total Payable</span>
          <div className="text-end">
            <span className="fs-5 fw-semibold">
              ₹ {roundedTotal.toLocaleString()}
            </span>
            {(finalDiscount > 0 || finalCouponDiscount > 0) && (
              <div className="text-muted small text-decoration-line-through">
                Original: ₹ {subtotalBeforeDiscounts.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FareSummaryCard;
// import React from "react";
// import { Card } from "react-bootstrap";

// const FareSummaryCard = ({
//   priceDetails,
//   blockedRoomData,
//   // ✅ ENHANCED: Receive coupon data from parent component
//   appliedCoupon = null,
//   couponDiscount = 0,
// }) => {
//   // Get data from blocked room response if available
//   // const roomData = blockedRoomData?.[0] || {};
//   // const priceData = roomData?.Price || {};
//   const roomData = blockedRoomData?.HotelRoomsDetails?.[0] || {};
//   const priceData = roomData?.Price || {};
//   console.log("🏷️ FareSummary - blockedRoomData:", blockedRoomData);
//   console.log("🏷️ FareSummary - priceData:", priceData);
//   console.log("🏷️ FareSummary - appliedCoupon:", appliedCoupon);
//   console.log("🏷️ FareSummary - couponDiscount:", couponDiscount);

//   // ✅ Extract prices from blocked room API response (source of truth)
//   const finalRoomPrice = priceData.RoomPrice || 0;
//   const finalPublishedPrice =
//     priceData.PublishedPrice || priceDetails?.baseFare || 0;
//   const finalTax = priceData.Tax || priceDetails?.tax || 0;
//   const finalDiscount = priceData.Discount || priceDetails?.discount || 0;
//   const finalServiceCharges =
//     priceData.ServiceCharges || priceDetails?.serviceCharges || 0;
//   const finalOtherCharges =
//     priceData.OtherCharges || priceDetails?.otherCharges || 0;
//   const agentCommission = priceData.AgentCommission || 0;
//   const tds = priceData.TDS || 0;

//   // GST data from blocked room response
//   // const gstData = priceData.GST || {};
//   // const cgstAmount = gstData.CGSTAmount || 0;
//   // const sgstAmount = gstData.SGSTAmount || 0;
//   // const igstAmount = gstData.IGSTAmount || 0;
//   // const cgstRate = gstData.CGSTRate || 0;
//   // const sgstRate = gstData.SGSTRate || 0;
//   // const igstRate = gstData.IGSTRate || 0;

//   // Use the published price from blocked room API as the main price
//   const actualBaseFare = finalPublishedPrice;

//   // Calculate vendor commission if not available from API
//   // Get vendor commission percentage from priceDetails or fallback to 0
//   // ✅ Get vendor commission % safely
//   // const vendorCommissionPercentage = Number(
//   //   priceData.VendorCommissionPercentage ??
//   //     priceDetails?.vendorCommissionPercentage ??
//   //     0
//   // );

//   // // ✅ Only calculate if percentage > 0
//   // const vendorCommissionAmount =
//   //   vendorCommissionPercentage > 0
//   //     ? (actualBaseFare * vendorCommissionPercentage) / 100
//   //     : 0;

//   // console.log("📊 Vendor Commission %:", vendorCommissionPercentage);
//   // console.log("📊 Calculated Commission:", vendorCommissionAmount);

//   // console.log("📊 Calculated Commission:", vendorCommissionAmount);
//   // ✅ Correct key from API
//   // const vendorCommissionPercentage = Number(
//   //   priceData.rasutripCommissionPercentage ??
//   //     priceDetails?.rasutripCommissionPercentage ??
//   //     priceDetails?.VendorCommissionPercentage ??
//   //     priceDetails?.vendorCommissionPercentage ??
//   //     0
//   // );

//   // // ✅ Calculate Commission
//   // const vendorCommissionAmount =
//   //   vendorCommissionPercentage > 0
//   //     ? (actualBaseFare * vendorCommissionPercentage) / 100
//   //     : 0;

//   // ✅ Commission Percentage from API
//   // ✅ Rasutrip Commission Percentage - Try multiple possible keys
//   // const rasutripCommissionPercentage = Number(
//   //   priceData?.rasutripCommissionPercentage ??
//   //     priceData?.RasutripCommissionPercentage ??
//   //     priceData?.rasuTripCommissionPercentage ??
//   //     priceData?.commission ??
//   //     priceData?.Commission ??
//   //     priceDetails?.rasutripCommissionPercentage ??
//   //     priceDetails?.vendorCommission ??
//   //     0
//   // );

//   const rasuTripCommissionAmount = Number(
//     priceData?.rasutripCommission ??
//       priceData?.RasutripCommission ??
//       priceData?.vendorCommission ??
//       priceDetails?.vendorCommission ??
//       priceDetails?.rasutripCommission ??
//       0
//   );

//   console.log("✅ Rasutrip Commission %:", rasutripCommissionPercentage);
//   console.log("🔍 Checking all possible commission fields:");
//   console.log(
//     "  - priceData.rasutripCommissionPercentage:",
//     priceData?.rasutripCommissionPercentage
//   );
//   console.log(
//     "  - priceData.RasutripCommissionPercentage:",
//     priceData?.RasutripCommissionPercentage
//   );
//   console.log("  - priceData.commission:", priceData?.commission);
//   console.log(
//     "  - priceDetails.vendorCommission:",
//     priceDetails?.vendorCommission
//   ); // ✅ RasuTrip Commission Amount (directly from API, not percentage)

//   console.log("✅ RasuTrip Commission Amount:", rasuTripCommissionAmount);

//   // ✅ Calculate percentage for display (optional)
//   const rasutripCommissionPercentage =
//     actualBaseFare > 0
//       ? ((rasuTripCommissionAmount / actualBaseFare) * 100).toFixed(2)
//       : 0;

//   console.log("✅ RasuTrip Commission %:", rasutripCommissionPercentage);
//   // Calculate total GST
//   // Read GST from API
//   // GST Base
//   // GST Base

//   // GST % for display
//   // console.log("GST from API:", priceData.GST);

//   // GST data from API (blockedRoomData -> priceData)

//   // ✅ Now GST will work
//   const gstData = priceData?.GST || {};
//   const gstPercentage =
//     (gstData.CGSTRate || 0) + (gstData.SGSTRate || 0) + (gstData.IGSTRate || 0);

//   console.log("✅ GST Percentage from API:", gstPercentage);

//   // ✅ CORRECTED: New calculation logic matching the payment component
//   // STEP 1: Calculate subtotal with all charges BEFORE any discounts
//   const subtotalBeforeDiscounts =
//     actualBaseFare +
//     finalTax +
//     // vendorCommissionAmount +
//     finalServiceCharges +
//     finalOtherCharges +
//     // totalGST +
//     tds;

//   // STEP 2: Apply hotel discount first (if any)
//   const subtotalAfterHotelDiscount = subtotalBeforeDiscounts - finalDiscount;

//   // STEP 3: Apply coupon discount to the final amount
//   const finalCouponDiscount = couponDiscount || 0;
//   const finalAmountAfterCoupon = Math.max(
//     0,
//     subtotalAfterHotelDiscount - finalCouponDiscount
//   );

//   // Final customer amount
//   const customerTotal = finalAmountAfterCoupon;
//   // const roundedTotal = parseFloat(customerTotal.toFixed(2));
//   // Final Total = Base Fare + Convenience Fee (Vendor Commission)
//   const roundedTotal = parseFloat(
//     (actualBaseFare + rasuTripCommissionAmount).toFixed(2)
//   );

//   console.log("💰 CORRECTED FareSummary Price Breakdown:", {
//     step1_subtotalBeforeDiscounts: subtotalBeforeDiscounts,
//     step2_hotelDiscount: finalDiscount,
//     step2_subtotalAfterHotelDiscount: subtotalAfterHotelDiscount,
//     step3_couponDiscount: finalCouponDiscount,
//     step3_finalAmountAfterCoupon: finalAmountAfterCoupon,
//     finalCustomerTotal: customerTotal,
//     roundedTotal,
//   });

//   return (
//     <Card className="mb-3 shadow-sm">
//       <Card.Header className="bg-light fw-bold">Fare Summary</Card.Header>
//       <Card.Body className="p-3">
//         {/* Room Price (Base price from hotel) */}
//         {/* {finalRoomPrice > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//             <span>Room Price</span>
//             <span>₹ {finalRoomPrice.toLocaleString()}</span>
//           </div>
//         )} */}

//         {/* Published Price (Main price for payment) */}
//         <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//           <span>Base Fare</span>
//           <span>₹ {actualBaseFare.toLocaleString()}</span>
//         </div>

//         {/* Taxes */}
//         {finalTax > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//             <span>Taxes</span>
//             <span>₹ {finalTax.toFixed(2)}</span>
//           </div>
//         )}

//         {/* Service Charges
//         {finalServiceCharges > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//             <span>Service Charges</span>
//             <span>₹ {finalServiceCharges.toFixed(2)}</span>
//           </div>
//         )}

//         {/* Other Charges */}
//         {/* {finalOtherCharges > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//             <span>Other Charges</span>
//             <span>₹ {finalOtherCharges.toFixed(2)}</span>
//           </div>
//         )} */}

//         {/* Service Charges */}
//         <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//           <span>Service Charges</span>
//           <span>₹ {finalServiceCharges.toFixed(2)}</span>
//         </div>

//         {/* Other Charges */}
//         <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//           <span>Other Charges</span>
//           <span>₹ {finalOtherCharges.toFixed(2)}</span>
//         </div>

//         {/* Convenience Fee (Your Commission) */}

//         <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//           <span>Convenience Fee</span>
//           <span>₹ {rasuTripCommissionAmount.toFixed(2)}</span>
//         </div>

//         {/* GST */}
//         {/* {totalGST > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//             <span>GST (+)</span>
//             <span>₹ {totalGST.toFixed(2)}</span>
//           </div>
//         )} */}
//         {/* GST */}
//         <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//           <span>GST</span>
//           <span>{gstPercentage}%</span>
//         </div>

//         {/* TDS */}
//         {/* {tds > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-info">
//             <span>TDS</span>
//             <span>₹ {tds.toFixed(2)}</span>
//           </div>
//         )} */}

//         {/* ✅ CORRECTED: Show subtotal before ANY discounts */}
//         {/* <div className="d-flex justify-content-between border-bottom pb-2 mb-2 fw-bold">
//           <span>Subtotal</span>
//           <span>₹ {subtotalBeforeDiscounts.toFixed(2)}</span>
//         </div> */}

//         {/* Hotel Discount (if any) - Applied FIRST */}
//         {finalDiscount > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-success">
//             <span>Hotel Discount (-)</span>
//             <span>- ₹ {finalDiscount.toFixed(2)}</span>
//           </div>
//         )}

//         {/* Show amount after hotel discount (before coupon) */}
//         {finalDiscount > 0 && finalCouponDiscount > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//             <span>Amount after Hotel Discount</span>
//             <span>₹ {subtotalAfterHotelDiscount.toFixed(2)}</span>
//           </div>
//         )}

//         {/* ✅ CORRECTED: Coupon Discount - Applied LAST */}
//         {finalCouponDiscount > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//             <div>
//               <span className="text-success fw-bold">
//                 <i className="bi bi-tag-fill me-2"></i>
//                 Coupon Discount (-)
//               </span>
//               {appliedCoupon && (
//                 <div>
//                   <small className="text-muted d-block">
//                     Code:{" "}
//                     <span className="fw-bold">
//                       {appliedCoupon.code || appliedCoupon.couponCode}
//                     </span>
//                   </small>
//                   {(appliedCoupon.discountType === "percentage" ||
//                     appliedCoupon.type === "PERCENTAGE") && (
//                     <small className="text-muted d-block">
//                       {appliedCoupon.discount || appliedCoupon.value}% off
//                     </small>
//                   )}
//                 </div>
//               )}
//             </div>
//             <span className="text-success fw-bold">
//               - ₹ {finalCouponDiscount.toFixed(2)}
//             </span>
//           </div>
//         )}

//         {/* ✅ CORRECTED: Final Total Payable Amount */}
//         <div className="d-flex justify-content-between pt-3 mt-3 border-top">
//           <span className="fs-5 fw-semibold">Total Payable</span>
//           <div className="text-end">
//             <span className="fs-5 fw-semibold">
//               ₹ {roundedTotal.toLocaleString()}
//             </span>
//             {/* Show original price if any discount applied */}
//             {(finalDiscount > 0 || finalCouponDiscount > 0) && (
//               <div className="text-muted small text-decoration-line-through">
//                 Original: ₹ {subtotalBeforeDiscounts.toFixed(2)}
//               </div>
//             )}
//           </div>
//         </div>
//       </Card.Body>
//     </Card>
//   );
// };

// export default FareSummaryCard;

// import React from "react";
// import { Card } from "react-bootstrap";

// const FareSummaryCard = ({
//   priceDetails = {},
//   blockedRoomData = {},
//   appliedCoupon = null,
//   couponDiscount = 0,
// }) => {
//   // ✅ State to preserve data when blockedRoomData becomes empty during navigation
//   const [preservedPriceData, setPreservedPriceData] = React.useState({});
//   const [preservedGstPercentage, setPreservedGstPercentage] = React.useState(0);

//   React.useEffect(() => {
//     // ✅ Handle multiple data structures
//     let roomData = null;

//     // Case 1: blockedRoomData is array (from BlockRoom API)
//     if (Array.isArray(blockedRoomData)) {
//       roomData = blockedRoomData[0];
//     }
//     // Case 2: blockedRoomData has HotelRoomsDetails (from BlockRoom API)
//     else if (blockedRoomData?.HotelRoomsDetails?.[0]) {
//       roomData = blockedRoomData.HotelRoomsDetails[0];
//     }
//     // Case 3: blockedRoomData is direct room object (from navigation)
//     else if (blockedRoomData?.Price) {
//       roomData = blockedRoomData;
//     }

//     const priceData = roomData?.Price || {};

//     // ✅ Only update if we have valid data
//     if (priceData && Object.keys(priceData).length > 0) {
//       setPreservedPriceData(priceData);

//       if (priceData?.GST) {
//         const totalGst =
//           (priceData.GST.CGSTRate || 0) +
//           (priceData.GST.SGSTRate || 0) +
//           (priceData.GST.IGSTRate || 0);
//         setPreservedGstPercentage(totalGst);
//       }
//     }
//   }, [blockedRoomData]);

//   console.log("🏷️ FareSummary - blockedRoomData:", blockedRoomData);
//   console.log("🏷️ FareSummary - preservedPriceData:", preservedPriceData);

//   // ✅ Use preserved data if current blockedRoomData is empty
//   let currentRoomData = null;

//   if (Array.isArray(blockedRoomData)) {
//     currentRoomData = blockedRoomData[0];
//   } else if (blockedRoomData?.HotelRoomsDetails?.[0]) {
//     currentRoomData = blockedRoomData.HotelRoomsDetails[0];
//   } else if (blockedRoomData?.Price) {
//     currentRoomData = blockedRoomData;
//   }

//   const currentPriceData = currentRoomData?.Price || {};

//   const activePriceData =
//     Object.keys(currentPriceData).length > 0
//       ? currentPriceData
//       : preservedPriceData;

//   // ✅ Extract prices using preserved data
//   const finalRoomPrice = activePriceData.RoomPrice || 0;
//   const finalPublishedPrice =
//     activePriceData.PublishedPrice || priceDetails?.baseFare || 0;
//   const finalTax = activePriceData.Tax || priceDetails?.tax || 0;
//   const finalDiscount = activePriceData.Discount || priceDetails?.discount || 0;
//   const finalServiceCharges =
//     activePriceData.ServiceCharges || priceDetails?.serviceCharges || 0;
//   const finalOtherCharges =
//     activePriceData.OtherCharges || priceDetails?.otherCharges || 0;
//   const agentCommission = activePriceData.AgentCommission || 0;
//   const tds = activePriceData.TDS || 0;

//   // ✅ GST calculation using preserved data
//   const gstData = activePriceData?.GST || {};
//   const totalGstPercentage =
//     (Number(gstData.CGSTRate) || 0) +
//       (Number(gstData.SGSTRate) || 0) +
//       (Number(gstData.IGSTRate) || 0) || preservedGstPercentage; // ✅ Fallback to preserved value

//   // ✅ GST amount calculation
//   const gstBaseAmount =
//     finalPublishedPrice + finalServiceCharges + finalOtherCharges;
//   const totalGstAmount = (gstBaseAmount * totalGstPercentage) / 100;

//   console.log("GST %:", totalGstPercentage, "GST Amount:", totalGstAmount);

//   const actualBaseFare = finalPublishedPrice;
//   // Vendor Commission calculation
//   const vendorCommissionPercentage = Number(
//     activePriceData?.rasutripCommissionPercentage ?? 0
//   );

//   // ✅ Make sure 0% stays 0
//   const vendorCommissionAmount =
//     vendorCommissionPercentage > 0
//       ? (actualBaseFare * vendorCommissionPercentage) / 100
//       : 0;

//   console.log("Vendor Commission %:", vendorCommissionPercentage);
//   console.log("Vendor Commission Amount:", vendorCommissionAmount);

//   // // ✅ Vendor Commission calculation
//   // const vendorCommissionPercentage = Number(
//   //   activePriceData.rasutripCommissionPercentage ??
//   //     priceDetails?.rasutripCommissionPercentage ??
//   //     priceDetails?.VendorCommissionPercentage ??
//   //     priceDetails?.vendorCommissionPercentage ??
//   //     0
//   // );

//   // const vendorCommissionAmount =
//   //   vendorCommissionPercentage > 0
//   //     ? (actualBaseFare * vendorCommissionPercentage) / 100
//   //     : 0;

//   // console.log("Correct Commission %:", vendorCommissionPercentage);
//   // console.log("Correct Commission Amount:", vendorCommissionAmount);
//   // console.log("✅ GST Percentage from API:", totalGstPercentage);
//   // console.log(vendorCommissionPercentage);

//   // ✅ SIMPLE CALCULATION: Only Base Fare + Commission
//   // GST and other charges are shown separately but NOT added to total
//   const subtotalBeforeDiscounts = actualBaseFare + vendorCommissionAmount;

//   // STEP 2: Apply hotel discount first (if any)
//   const subtotalAfterHotelDiscount = subtotalBeforeDiscounts - finalDiscount;

//   // STEP 3: Apply coupon discount to the final amount
//   const finalCouponDiscount = couponDiscount || 0;
//   const finalAmountAfterCoupon = Math.max(
//     0,
//     subtotalAfterHotelDiscount - finalCouponDiscount
//   );

//   // ✅ Final Total = Base Fare + Commission (discounts applied)
//   const roundedTotal = parseFloat(finalAmountAfterCoupon.toFixed(2));

//   console.log("💰 CORRECTED FareSummary Price Breakdown:", {
//     actualBaseFare,
//     finalTax,
//     vendorCommissionAmount,
//     finalServiceCharges,
//     finalOtherCharges,
//     totalGstAmount,
//     tds,
//     step1_subtotalBeforeDiscounts: subtotalBeforeDiscounts,
//     step2_hotelDiscount: finalDiscount,
//     step2_subtotalAfterHotelDiscount: subtotalAfterHotelDiscount,
//     step3_couponDiscount: finalCouponDiscount,
//     step3_finalAmountAfterCoupon: finalAmountAfterCoupon,
//     roundedTotal,
//   });

//   return (
//     <Card className="mb-3 shadow-sm">
//       <Card.Header className="bg-light fw-bold">Fare Summary</Card.Header>
//       <Card.Body className="p-3">
//         {/* Base Fare */}
//         <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//           <span>Base Fare</span>
//           <span>₹ {actualBaseFare.toLocaleString()}</span>
//         </div>

//         {/* Taxes */}
//         <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//           <span>Taxes</span>
//           <span>₹ {finalTax.toFixed(2)}</span>
//         </div>

//         {/* Service Charges */}
//         <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//           <span>Service Charges</span>
//           <span>₹ {finalServiceCharges.toFixed(2)}</span>
//         </div>

//         {/* Other Charges */}
//         <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//           <span>Other Charges</span>
//           <span>₹ {finalOtherCharges.toFixed(2)}</span>
//         </div>

//         {/* Convenience Fee */}
//         <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//           <span>Convenience Fee</span>
//           <span>₹ {vendorCommissionAmount.toFixed(2)}</span>
//         </div>

//         {/* GST - Now stays consistent even after navigation */}
//         {totalGstPercentage > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//             <span>GST ({totalGstPercentage}%)</span>
//             <span>₹ {totalGstAmount.toFixed(2)}</span>
//           </div>
//         )}

//         {/* TDS */}
//         {tds > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-info">
//             <span>TDS</span>
//             <span>₹ {tds.toFixed(2)}</span>
//           </div>
//         )}

//         {/* Hotel Discount */}
//         {finalDiscount > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2 text-success">
//             <span>Hotel Discount (-)</span>
//             <span>- ₹ {finalDiscount.toFixed(2)}</span>
//           </div>
//         )}

//         {/* Show amount after hotel discount */}
//         {finalDiscount > 0 && finalCouponDiscount > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//             <span>Amount after Hotel Discount</span>
//             <span>₹ {subtotalAfterHotelDiscount.toFixed(2)}</span>
//           </div>
//         )}

//         {/* Coupon Discount */}
//         {finalCouponDiscount > 0 && (
//           <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
//             <div>
//               <span className="text-success fw-bold">
//                 <i className="bi bi-tag-fill me-2"></i>
//                 Coupon Discount (-)
//               </span>
//               {appliedCoupon && (
//                 <div>
//                   <small className="text-muted d-block">
//                     Code:{" "}
//                     <span className="fw-bold">
//                       {appliedCoupon.code || appliedCoupon.couponCode}
//                     </span>
//                   </small>
//                   {(appliedCoupon.discountType === "percentage" ||
//                     appliedCoupon.type === "PERCENTAGE") && (
//                     <small className="text-muted d-block">
//                       {appliedCoupon.discount || appliedCoupon.value}% off
//                     </small>
//                   )}
//                 </div>
//               )}
//             </div>
//             <span className="text-success fw-bold">
//               - ₹ {finalCouponDiscount.toFixed(2)}
//             </span>
//           </div>
//         )}

//         {/* Final Total - Now includes GST */}
//         <div className="d-flex justify-content-between pt-3 mt-3 border-top">
//           <span className="fs-5 fw-semibold">Total Payable</span>
//           <div className="text-end">
//             <span className="fs-5 fw-semibold">
//               ₹ {roundedTotal.toLocaleString()}
//             </span>
//             {(finalDiscount > 0 || finalCouponDiscount > 0) && (
//               <div className="text-muted small text-decoration-line-through">
//                 Original: ₹ {subtotalBeforeDiscounts.toFixed(2)}
//               </div>
//             )}
//           </div>
//         </div>
//       </Card.Body>
//     </Card>
//   );
// };

// export default FareSummaryCard;
