import React, { useState } from 'react';
import axios from 'axios';
import Imagefetch from './Components/Imagefetch.jsx';

const App = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);

  const sendOTP = async () => {
    try {
      const res = await axios.post('http://localhost:3000/send-otp', { phoneNumber });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending OTP");
    }
  };

  const verifyOTP = async () => {
    try {
      const res = await axios.post('http://localhost:3000/verify-otp', { phoneNumber, otp });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error verifying OTP");
    }
  };

  

  return (
    <div style={{ padding: '2rem' }}>
      <Imagefetch/>
      <h2>Twilio OTP Verification</h2>

      {step === 1 && (
        <>
          <input
            type="text"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <button onClick={sendOTP}>Send OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOTP}>Verify OTP</button>
        </>
      )}

      <div>{message}</div>
    </div>
  );
};

export default App;
