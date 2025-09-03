import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FlightLoader from '../FlightLoader/FlightLoader';

const MyVerticallyCenteredModal = (props, {IsBook = false}) => {
    const message = IsBook ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>Booking failed! 😞</p>
            <p>
                Please contact our support team:
                <strong>+91-9876543210</strong> or &nbsp;
                <a href="mailto:support@rasutrip.com" className="text-blue-600 underline">
                    support@rasutrip.com
                </a>

            </p>
            <div className='text-center'> <a href='/' > Go to Home Page</a> </div>
        </div>
    ) : (
        <p>Please wait, booking confirmation underway...</p>
    );


    return (
        <Modal
            {...props}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Body style={{ height: "40vh" }} >
                <div >
                    <FlightLoader message={message} IsBook={IsBook} subMessage="Don't refresh the page" color="red" />
                </div>
            </Modal.Body>

        </Modal>
    );
}


export default MyVerticallyCenteredModal