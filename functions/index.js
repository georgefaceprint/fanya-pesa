const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure the email transport using the default SMTP transport and a Gmail account/App Password.
// For production, using SendGrid or Mailgun is recommended.
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.onUserVerified = functions.firestore.document('users/{userId}')
    .onUpdate(async (change, context) => {
        const newValue = change.after.data();
        const previousValue = change.before.data();

        // Check if the verified field changed from false/undefined to true
        if (newValue.verified === true && previousValue.verified !== true) {
            const email = newValue.email;
            const name = newValue.name || 'User';

            const mailOptions = {
                from: '"Fanya Pesa" <noreply@fanyapesa.co.za>',
                to: email,
                subject: 'Fanya Pesa - Profile Verified ✅',
                text: `Hello ${name},\n\nGood news! Your profile has been successfully verified by a Fanya Pesa admin.\n\nYou can now fully utilize the platform to matching with funders and requesting quotes.\n\nBest Regards,\nThe Fanya Pesa Team`,
                html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #3b82f6;">Profile Verified! ✅</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Good news! Your profile has been successfully verified by a Fanya Pesa admin.</p>
            <p>You can now fully utilize the platform to match with funders and request quotes from our national database.</p>
            <br/>
            <a href="https://fanya-pesa.vercel.app" style="background:#3b82f6;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Go to Dashboard</a>
            <br/><br/>
            <p>Best Regards,</p>
            <p><strong>The Fanya Pesa Team</strong></p>
          </div>
        `
            };

            try {
                await mailTransport.sendMail(mailOptions);
                console.log(`Verification email successfully sent to: ${email}`);
            } catch (error) {
                console.error('Error sending verification email:', error);
            }
        } else {
            console.log('User was updated but verification status did not change to true.');
        }

        return null;
    });
