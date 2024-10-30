// frontend/src/components/QRScanner.js
import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import './QRScanner.css';
import { Alert } from 'react-bootstrap';

function QRScanner() {
  const [screenColor, setScreenColor] = useState('#fff');
  const [message, setMessage] = useState('');
  const [scannerVisible, setScannerVisible] = useState(true);
  const [alert, setAlert] = useState({ variant: '', message: '' });

  // Function to determine qrbox size based on screen width
  const getQrBoxSize = () => {
    const width = window.innerWidth;
    if (width >= 1200) return 300; // Large screens
    if (width >= 768) return 250;  // Medium screens
    return 200;                     // Small screens
  };

  useEffect(() => {
    if (scannerVisible) {
      const qrBox = getQrBoxSize();
      const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: qrBox });

      scanner.render(onScanSuccess, onScanFailure);

      function onScanSuccess(decodedText) {
        // Extract IND_ID and couponIndex from the decoded URL
        // Assuming the QR code contains a URL like: https://yourdomain.com/users/IND_ID/coupon/CouponIndex
        const url = decodedText.trim();
        try {
          const urlObj = new URL(url);
          const pathSegments = urlObj.pathname.split('/');
          const indIdIndex = pathSegments.findIndex(segment => segment === 'users') + 1;
          const couponIndexIndex = pathSegments.findIndex(segment => segment === 'coupon') + 1;

          const indId = pathSegments[indIdIndex];
          const couponIndex = parseInt(pathSegments[couponIndexIndex]);

          if (!indId || isNaN(couponIndex) || couponIndex < 1 || couponIndex > 9) {
            throw new Error('Invalid QR Code format.');
          }

          // Make API call to scan the coupon
          axios
            .post(`${process.env.REACT_APP_BACKEND_URL}/api/scan`, { IND_ID: indId, couponIndex })
            .then((response) => {
              const { status, message } = response.data;
              if (status === 'green') {
                setScreenColor('#28a745'); // Green
                setMessage(message);
              } else if (status === 'red') {
                setScreenColor('#dc3545'); // Red
                setMessage(message);
              } else {
                setScreenColor('#ffc107'); // Yellow
                setMessage(message);
              }

              setScannerVisible(false);
              setAlert({ variant: status === 'green' ? 'success' : 'danger', message });

              setTimeout(() => {
                setScreenColor('#fff');
                setMessage('');
                setAlert({ variant: '', message: '' });
                setScannerVisible(true);
              }, 3000);
            })
            .catch(() => {
              setScreenColor('#dc3545'); // Red
              setMessage('Error Occurred');
              setScannerVisible(false);
              setAlert({ variant: 'danger', message: 'An error occurred while processing the scan.' });

              setTimeout(() => {
                setScreenColor('#fff');
                setMessage('');
                setAlert({ variant: '', message: '' });
                setScannerVisible(true);
              }, 3000);
            });
        } catch (error) {
          console.error('QR Code parsing error:', error);
          setScreenColor('#dc3545'); // Red
          setMessage('Invalid QR Code.');
          setScannerVisible(false);
          setAlert({ variant: 'danger', message: 'Invalid QR Code.' });

          setTimeout(() => {
            setScreenColor('#fff');
            setMessage('');
            setAlert({ variant: '', message: '' });
            setScannerVisible(true);
          }, 3000);
        }
      }

      function onScanFailure(error) {
        // Optionally handle scan failures
        console.warn(`QR Code scan error: ${error}`);
      }

      // Cleanup scanner on component unmount or when scanner becomes invisible
      return () => {
        scanner.clear().catch((error) => {
          console.error('Failed to clear scanner', error);
        });
      };
    }
  }, [scannerVisible]);

  if (alert.message) {
    return (
      <div className="screen" style={{ backgroundColor: screenColor }}>
        <Alert variant={alert.variant} className="message">
          {alert.message}
        </Alert>
      </div>
    );
  }

  return (
    <div className="qr-scanner">
      <h1 className="text-center">QR Scanner</h1>
      <div id="reader"></div>
    </div>
  );
}

export default QRScanner;
