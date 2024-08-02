const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const client = require('twilio')(accountSid, authToken);

exports.sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ status: false, message: 'Phone number is required' });
  }

  try {
    const verification = await client.verify.v2.services(serviceSid)
      .verifications
      .create({ to: phoneNumber, channel: 'sms' });

    res.status(200).json({ status: true, message: 'OTP sent successfully', sid: verification.sid });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ status: false, message: 'Failed to send OTP', error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
    const { phoneNumber, code } = req.body;
  
    if (!phoneNumber || !code) {
      return res.status(400).json({ status: false, message: 'Phone number and code are required' });
    }
  
    try {
      const verificationCheck = await client.verify.v2.services(serviceSid)
        .verificationChecks
        .create({ to: phoneNumber, code: code });
  
      if (verificationCheck.status === 'approved') {
        res.status(200).json({ status: true, message: 'OTP verified successfully' });
      } else {
        res.status(400).json({ status: false, message: 'Invalid OTP' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ status: false, message: 'Failed to verify OTP', error: error.message });
    }
};