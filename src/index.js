import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { LocationProvider } from "./Components/Context/LocationContext";
import { HotelSearchProvider } from "./Components/Context/HotelSearchContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <LocationProvider>
        <HotelSearchProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </HotelSearchProvider>
      </LocationProvider>
    </Provider>
  </React.StrictMode>
);
