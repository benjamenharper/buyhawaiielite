const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
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
    await resend.emails.send({
      from: 'Hawaii Elite Real Estate <forms@hawaiieliterealestate.com>',
      to: process.env.NOTIFICATION_EMAIL,
      subject,
      text,
      reply_to: email
    });

    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Form submission error:', error);
    console.error('API Key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
    console.error('Notification Email:', process.env.NOTIFICATION_EMAIL ? 'Present' : 'Missing');
    res.status(500).json({ 
      message: 'Error submitting form',
      error: error.message || 'Unknown error'
    });
  }
};
