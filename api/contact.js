const { Resend } = require('resend');

console.log('Initializing Resend with API key:', process.env.RESEND_API_KEY ? 'Present (length: ' + process.env.RESEND_API_KEY.length + ')' : 'Missing');
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  console.log('API Request received:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    env: {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Not set',
      NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL ? 'Set' : 'Not set'
    }
  });
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, phone, interest, propertyAddress, propertyPrice, message, formType } = req.body;

    // Create email content based on form type
    let subject = '';
    let text = '';

    switch (formType) {
      case 'contact':
        subject = `New Contact Form Submission - ${interest}`;
        text = `
          Name: ${name}
          Email: ${email}
          Phone: ${phone}
          Interest: ${interest}
        `;
        break;
      case 'property':
        subject = `Property Inquiry - ${propertyAddress}`;
        text = `
          Name: ${name}
          Email: ${email}
          Phone: ${phone}
          Property: ${propertyAddress}
          Price: ${propertyPrice}
          Message: ${message || 'No message provided'}
        `;
        break;
      default:
        subject = 'New Form Submission';
        text = JSON.stringify(req.body, null, 2);
    }

    // Send email using Resend
    console.log('Attempting to send email with:', {
      to: process.env.NOTIFICATION_EMAIL,
      subject,
      hasReplyTo: !!email
    });
    
    const result = await resend.emails.send({
      from: 'Hawaii Elite Real Estate <forms@hawaiieliterealestate.com>',
      to: process.env.NOTIFICATION_EMAIL,
      subject,
      text,
      reply_to: email
    });

    console.log('Email sent successfully:', result);
    res.status(200).json({ message: 'Form submitted successfully', result });
  } catch (error) {
    console.error('Form submission error:', {
      error: error,
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.data || error.response,
      env: {
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Not set',
        NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL ? 'Set' : 'Not set'
      }
    });
    res.status(500).json({ 
      message: 'Error submitting form',
      error: `${error.message} (Code: ${error.code || 'none'})`
    });
  }
};
