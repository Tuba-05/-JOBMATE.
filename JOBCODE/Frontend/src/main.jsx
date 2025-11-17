// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import { BrowserRouter } from "react-router-dom";
// import './index.css'

import React from 'react';
import ReactDOM from "react-dom/client"; // Adjusted for the new import
import App from './App.jsx' // Ensure this points to the correct App component
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap styles
import 'boxicons/css/boxicons.min.css'; // Boxicons styles

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
