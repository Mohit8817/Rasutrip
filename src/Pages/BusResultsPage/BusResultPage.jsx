import { Container, Row, Col, Spinner } from "react-bootstrap";
import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import BusSearchSummary from "../../Components/Bus/BusPage/BusSearchSummary";
import BusSidebarFilter from "../../Components/Bus/BusPage/BusSidebarFilter";
import BusDetailsList from "../../Components/Bus/BusPage/BusDetailsList";
import { fetchBusResults } from "../../Components/APIS/BusApi/BusApis";
import { LocationContext } from "../../Components/Context/LocationContext";
import Busloader from "../../Components/Bus/Busloader/Busloader";

const USER_IP_FALLBACK = "122.161.64.143";

const BusResultPage = () => {
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [actualPriceRange, setActualPriceRange] = useState([0, 10000]);

    const [selectedOperators, setSelectedOperators] = useState([]);
    const [selectedBusTypes, setSelectedBusTypes] = useState([]);

    const [availableOperators, setAvailableOperators] = useState([]);
    const [availableBusTypes, setAvailableBusTypes] = useState([]);

    // Bus data state
    const [masterBusList, setMasterBusList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noBusesFound, setNoBusesFound] = useState(false);

    const { state } = useLocation();
    const { locationData } = useContext(LocationContext);

    // Get search parameters
    const from = state?.fromCity ?? null;
    const to = state?.toCity ?? null;
    const OriginId = state?.fromCityId;
    const DestinationId = state?.toCityId;
    const UserIp = USER_IP_FALLBACK;

    // Use date from LocationContext (updated by calendar) instead of navigation state
    const formattedDate = locationData?.departDate ?? state?.departDate ?? null;
    const DateOfJourney = formattedDate ? new Date(formattedDate).toISOString().split("T")[0] : null;

    // Duration calculation helper
    const getDuration = (start, end) => {
        const ms = end - start;
        const hrs = Math.floor(ms / 3600000);
        const mins = Math.floor((ms % 3600000) / 60000);
        return `${hrs}h ${mins}m`;
    };

    // Enhanced function to calculate fare with vendor commission
    const calculateFareWithCommission = (busPrice, vendorCommissionPercentage) => {
        const basePrice = busPrice?.PublishedPrice || 0;
        const vendorCommissionAmount = (basePrice * vendorCommissionPercentage) / 100;
        const totalPrice = basePrice + vendorCommissionAmount;

        return {
            basePrice,
            vendorCommissionAmount,
            vendorCommissionPercentage,
            totalPrice,
            displayPrice: totalPrice
        };
    };

    // Fetch bus data
    useEffect(() => {
        const getBusData = async () => {
            if (!from || !to || !DateOfJourney) {
                setIsLoading(false);
                setError("Missing search parameters");
                return;
            }

            setIsLoading(true);
            setError(null);
            setNoBusesFound(false);

            try {
                console.log("Fetching buses for date:", DateOfJourney);

                const apiResult = await fetchBusResults(
                    DateOfJourney,
                    OriginId,
                    DestinationId,
                    UserIp
                );

                // Check if Result exists and has items
                if (!apiResult.Result || apiResult.Result.length === 0) {
                    setNoBusesFound(true);
                    setIsLoading(false);
                    return;
                }

                // Updated portion of BusResultPage.js - around line 90-130

                const mapped = apiResult.Result.map((item) => {
                    const dep = new Date(item.DepartureTime);
                    const arr = new Date(item.ArrivalTime);

                    // Get vendor commission percentage from API response
                    const vendorCommissionPercentage = item.BusPrice?.rasutripCommissionPercentage || 0;

                    // Get base price from API
                    const basePrice = item.BusPrice?.PublishedPrice || 0;

                    // Calculate fare with vendor commission (for booking purposes)
                    const fareDetails = calculateFareWithCommission(item.BusPrice, vendorCommissionPercentage);

                    return {
                        operator: item.TravelName || "N/A",
                        serviceName: item.ServiceName || "N/A",
                        busType: item.BusType || "N/A",
                        departTime: dep.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        arriveTime: arr.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        departDate: dep.toLocaleDateString("en-CA"),
                        arriveDate: arr.toLocaleDateString("en-CA"),
                        departLocation: item.BoardingPointsDetails?.[0]?.CityPointLocation || from,
                        arriveLocation: item.DroppingPointsDetails?.[0]?.CityPointLocation || to,
                        duration: getDuration(dep, arr),

                        // DISPLAY PRICE - Show exact API response value without formatting
                        price: `₹ ${basePrice}`,
                        numericPrice: basePrice, // This is used for price range filtering

                        // Keep original price for reference
                        originalPrice: basePrice,

                        // BOOKING PRICES - All pricing details for booking process
                        totalPriceWithCommission: fareDetails.totalPrice,
                        vendorCommissionPercentage: vendorCommissionPercentage,
                        vendorCommissionAmount: fareDetails.vendorCommissionAmount,

                        // Complete fare breakdown for booking
                        fareBreakdown: {
                            basePrice: basePrice,
                            vendorCommissionAmount: fareDetails.vendorCommissionAmount,
                            vendorCommissionPercentage: vendorCommissionPercentage,
                            totalPrice: fareDetails.totalPrice, // This includes commission
                            taxes: item.BusPrice?.Tax || 0,
                            otherCharges: item.BusPrice?.OtherCharges || 0,
                            gst: item.BusPrice?.GST ?
                                (item.BusPrice.GST.CGSTAmount + item.BusPrice.GST.SGSTAmount + item.BusPrice.GST.IGSTAmount) : 0
                        },

                        seatsAvailable: item.AvailableSeats || 0,
                        cancellationPolicies: item.CancellationPolicies || [],
                        ResultIndex: item.ResultIndex,
                        SearchTokenId: apiResult.SearchTokenId,
                        OriginId,
                        DestinationId,
                        UserIp,
                        BoardingPointsDetails: item.BoardingPointsDetails || [],
                        DroppingPointsDetails: item.DroppingPointsDetails || [],

                        // Store original bus price object for reference
                        originalBusPrice: item.BusPrice
                    };
                });

                setMasterBusList(mapped);

                // Set price range based on BASE PRICES (not commission prices)
                const basePrices = mapped.map((b) => b.numericPrice).filter(price => price > 0);
                if (basePrices.length > 0) {
                    const min = Math.min(...basePrices);
                    const max = Math.max(...basePrices);
                    setActualPriceRange([min, max]);
                    setPriceRange([min, max]);
                }

                // Set available operators and bus types
                setAvailableOperators([...new Set(mapped.map((b) => b.operator))]);
                setAvailableBusTypes([...new Set(mapped.map((b) => b.busType))]);

            } catch (err) {
                console.error("Bus API Error:", err);
                setError("Failed to fetch bus data");
            } finally {
                setIsLoading(false);
            }
        };

        getBusData();
    }, [DateOfJourney, DestinationId, OriginId, from, to]);

    // Format date for display
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Show loader while data is loading
    if (isLoading) {
        return (
            <Container fluid className="mt-5 min-vh-100">
                <Row>
                    <Col className="text-center">
                        <Busloader
                            from={from}
                            to={to}
                            departDate={formatDateForDisplay(DateOfJourney)}
                        />
                    </Col>
                </Row>
            </Container>
        );
    }

    // Show "No buses found" message when API returns empty result
    if (noBusesFound) {
        return (
            <Container fluid className=" mt-5 pt-4 min-vh-100">
                <Row>
                    <Col className="text-center">
                        <div className="d-flex flex-column align-items-center">
                            <i className="fas fa-bus fa-4x text-muted mb-3"></i>
                            <h4 className="text-muted">No Buses Found</h4>
                            <p className="text-muted">
                                Sorry, no buses are available for your selected route and date.
                            </p>
                            <p className="text-secondary">
                                From: <strong>{from}</strong> → To: <strong>{to}</strong>
                            </p>
                            <p className="text-secondary">
                                Date: <strong>{formatDateForDisplay(DateOfJourney)}</strong>
                            </p>
                            <small className="text-muted mt-2">
                                Please try searching for a different date or route.
                            </small>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }

    // Show error if any
    if (error) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
                <Row>
                    <Col className="text-center">
                        <h4>Error</h4>
                        <p className="text-danger">{error}</p>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Top section */}
                <div className="col-span-12">
                    <BusSearchSummary />
                </div>

                {/* Sidebar filter (only show on lg and above) */}
                <div className="hidden lg:block lg:col-span-3">
                    <BusSidebarFilter
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        actualPriceRange={actualPriceRange}
                        selectedOperators={selectedOperators}
                        setSelectedOperators={setSelectedOperators}
                        selectedBusTypes={selectedBusTypes}
                        setSelectedBusTypes={setSelectedBusTypes}
                        availableOperators={availableOperators}
                        availableBusTypes={availableBusTypes}
                    />
                </div>

                {/* Bus details list */}
                <div className="col-span-12 lg:col-span-9 p-0 m-0">
                    <BusDetailsList
                        masterBusList={masterBusList}
                        priceRange={priceRange}
                        selectedOperators={selectedOperators}
                        selectedBusTypes={selectedBusTypes}
                    />
                </div>
            </div>
        </div>
    );
};

export default BusResultPage;