import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Provider } from 'react-redux';
import { store } from './redux/store';
import { LocationProvider } from './Components/Context/LocationContext';
import ErrorBoundary from './Components/ErrorBoundray'; // Adjust path if needed

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    {/* <ErrorBoundary> */}
      <Provider store={store}>
        <LocationProvider>
          <App />
        </LocationProvider>
      </Provider>
    {/* </ErrorBoundary> */}
  </React.StrictMode>
);
