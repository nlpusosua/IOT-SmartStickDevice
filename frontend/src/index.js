import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import 'leaflet/dist/leaflet.css';

if (process.env.NODE_ENV === 'production' || true) { // Để 'true' nếu muốn tắt luôn ở localhost
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {}; // Tùy chọn: Tắt luôn cả báo lỗi
  console.info = () => {};
  console.debug = () => {};
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);


