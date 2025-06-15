import React from 'react';
import HotelReviewPage from './HotelReviewPage';
import FareSummaryCard from './FareSummaryCard';
import PromoCodeCard from './PromoCodeCard';
import StepNavigation from './StepNavigation';

const ReviewPage = () => {
  return (
    <div style={styles.container}>
      {/* Step Navigation */}
      <div style={styles.stepNav}>
        <StepNavigation />
      </div>

      <div style={styles.contentArea}>
        {/* Left side - Hotel Details */}
        <div style={styles.leftSection}>
          <HotelReviewPage />
        </div>

        {/* Right side - Fare Summary and Promo Code */}
        <div style={styles.rightSection}>
          <FareSummaryCard />
          <PromoCodeCard />
        </div>
      </div>

      {/* Continue Payment Button */}
      <div style={styles.buttonContainer}>
        <button style={styles.paymentButton}>Continue Payment</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'sans-serif',
    padding: '20px',
    backgroundColor: '#f9f9f9',
  },
  stepNav: {
    marginBottom: '20px',
  },
  contentArea: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
  },
  leftSection: {
    flex: 2,
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  rightSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  buttonContainer: {
    textAlign: 'center',
    marginTop: '30px',
  },
  paymentButton: {
    backgroundColor: '#6200ea',
    color: '#fff',
    border: 'none',
    padding: '12px 30px',
    fontSize: '16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default ReviewPage;
