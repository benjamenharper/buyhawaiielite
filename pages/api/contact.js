import nodemailer from 'nodemailer';

export default async function handler(req, res) {
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

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.NOTIFICATION_EMAIL,
      subject,
      text,
    });

    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ message: 'Error submitting form' });
  }
}
