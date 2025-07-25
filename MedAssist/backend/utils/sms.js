const axios = require('axios');

const sendSMS = async (phoneNumber, message) => {
  try {
    // Using Africa's Talking SMS API
    const response = await axios.post('https://api.africastalking.com/version1/messaging', {
      username: process.env.SMS_USERNAME,
      to: phoneNumber,
      message: message
    }, {
      headers: {
        'apiKey': process.env.SMS_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw new Error('Failed to send SMS');
  }
};

module.exports = { sendSMS };