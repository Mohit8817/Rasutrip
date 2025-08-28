import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FlightLoader from '../FlightLoader/FlightLoader';

const MyVerticallyCenteredModal = (props) => {
    return (
        <Modal
            {...props}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Body style={{height:"40vh"}} >
                <div >
                    <FlightLoader message="Please wait, booking confirmation underway." color="red" />
                </div>
            </Modal.Body>

        </Modal>
    );
}


export default MyVerticallyCenteredModal