import React from 'react'
import BookingSteps from './BookingSteps'
import FlightInfo from './FlightInfo'
import ContinueBookingButton from './ContinueBookingButton'
import FareSummary from './FareSummary'
import PromoCodeBox from './PromoCodeBox'


const FlightDetails = () => {
    return (
        <div>
            <div className="container my-4 mt-5 pt-5">
                <BookingSteps activeIndex={0} />
                <div className="d-flex flex-wrap gap-4">
                    <div style={{ flex: 2 }}>
                        <FlightInfo />
                        <ContinueBookingButton />
                    </div>

                    <div style={{ flex: 1 }}>
                        <FareSummary />
                        <PromoCodeBox />
                    </div>
                </div>
            </div>


        </div>
    )
}

export default FlightDetails