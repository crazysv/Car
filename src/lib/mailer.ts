import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL || 'notifications@jprentals.in';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@jprentals.in';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | Date) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    dateStyle: 'medium',
  });
}

/**
 * Common layout wrapper for HTML emails
 */
function wrapHtml(title: string, content: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; margin-top: 40px; border: 1px solid #eaeaea; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #eaeaea; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #1a1a1a; font-size: 24px; }
          .content { font-size: 16px; color: #444; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 14px; color: #888; }
          .detail-row { margin-bottom: 10px; }
          .detail-label { font-weight: 600; color: #555; }
          .btn { display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eaeaea; }
          th { font-weight: 600; color: #555; background-color: #fcfcfc; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>JP Rentals &copy; ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// -----------------------------------------------------------------------------
// Email Triggers
// -----------------------------------------------------------------------------

export async function sendNewBookingAdminEmail(params: {
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleName: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  paymentMode: string;
  bookingStatus: string;
  paymentStatus: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  
  try {
    const html = wrapHtml(
      `New Booking: ${params.bookingRef}`,
      `
      <p>A new booking has been placed.</p>
      <table>
        <tr><th>Booking Ref</th><td>${params.bookingRef}</td></tr>
        <tr><th>Customer Name</th><td>${params.customerName}</td></tr>
        <tr><th>Customer Phone</th><td>${params.customerPhone}</td></tr>
        <tr><th>Customer Email</th><td>${params.customerEmail}</td></tr>
        <tr><th>Vehicle</th><td>${params.vehicleName}</td></tr>
        <tr><th>Dates</th><td>${formatDate(params.pickupDate)} to ${formatDate(params.returnDate)}</td></tr>
        <tr><th>Location</th><td>${params.pickupLocation}</td></tr>
        <tr><th>Payment Mode</th><td>${params.paymentMode}</td></tr>
        <tr><th>Booking Status</th><td>${params.bookingStatus}</td></tr>
        <tr><th>Payment Status</th><td>${params.paymentStatus}</td></tr>
      </table>
      <p>Log in to the admin dashboard for full details.</p>
      `
    );

    await resend.emails.send({
      from: `JP Rentals <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `[JP Rentals] New Booking: ${params.bookingRef}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send admin new booking email:', error);
  }
}

export async function sendBookingConfirmationEmail(params: {
  toEmail: string;
  customerName: string;
  bookingRef: string;
  vehicleName: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  paymentMode: string;
  rentalTotal: number;
  advanceAmount: number;
  securityDeposit: number;
}) {
  if (!process.env.RESEND_API_KEY) return;

  try {
    const isOnlineUnpaid = params.paymentMode === 'online'; // Assuming they haven't paid yet at initial booking

    const html = wrapHtml(
      `Booking Confirmed`,
      `
      <p>Hi ${params.customerName},</p>
      <p>Your booking request with JP Rentals has been received.</p>
      
      <table>
        <tr><th>Booking Reference</th><td><strong>${params.bookingRef}</strong></td></tr>
        <tr><th>Vehicle</th><td>${params.vehicleName}</td></tr>
        <tr><th>Dates</th><td>${formatDate(params.pickupDate)} to ${formatDate(params.returnDate)}</td></tr>
        <tr><th>Pickup Location</th><td>${params.pickupLocation}</td></tr>
        <tr><th>Payment Mode</th><td>${params.paymentMode === 'online' ? 'Online' : 'Offline'}</td></tr>
        <tr><th>Rental Total</th><td>${formatCurrency(params.rentalTotal)}</td></tr>
        <tr><th>Advance Amount</th><td>${formatCurrency(params.advanceAmount)}</td></tr>
        <tr><th>Security Deposit</th><td>${formatCurrency(params.securityDeposit)}</td></tr>
      </table>

      ${isOnlineUnpaid ? '<p>Please note: If you selected online payment, you need to complete the advance payment to fully confirm your booking.</p>' : ''}
      
      <p style="text-align: center;">
        <a href="https://jp-rentals.com/my-bookings" class="btn">View My Bookings</a>
      </p>
      `
    );

    await resend.emails.send({
      from: `JP Rentals <${FROM_EMAIL}>`,
      to: params.toEmail,
      subject: `Your JP Rentals Booking: ${params.bookingRef}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send customer confirmation email:', error);
  }
}

export async function sendPaymentSuccessEmail(params: {
  toEmail: string;
  customerName: string;
  bookingRef: string;
  amount: number;
  bookingStatus: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  try {
    const html = wrapHtml(
      `Payment Received`,
      `
      <p>Hi ${params.customerName},</p>
      <p>We have successfully received your payment of <strong>${formatCurrency(params.amount)}</strong> for booking <strong>${params.bookingRef}</strong>.</p>
      <p>Your booking status is currently: <strong>${params.bookingStatus}</strong>.</p>
      <p>Our team will process your booking and reach out shortly if further details are needed.</p>
      <p style="text-align: center;">
        <a href="https://jp-rentals.com/my-bookings" class="btn">View My Bookings</a>
      </p>
      `
    );

    await resend.emails.send({
      from: `JP Rentals <${FROM_EMAIL}>`,
      to: params.toEmail,
      subject: `Payment Success: ${params.bookingRef}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send payment success email:', error);
  }
}

export async function sendCancellationRequestAdminEmail(params: {
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleName: string;
  pickupDate: string;
  returnDate: string;
  currentStatus: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  try {
    const html = wrapHtml(
      `Cancellation Request: ${params.bookingRef}`,
      `
      <p>A customer has requested to cancel their booking.</p>
      <table>
        <tr><th>Booking Ref</th><td>${params.bookingRef}</td></tr>
        <tr><th>Customer Name</th><td>${params.customerName}</td></tr>
        <tr><th>Customer Contact</th><td>${params.customerPhone} | ${params.customerEmail}</td></tr>
        <tr><th>Vehicle</th><td>${params.vehicleName}</td></tr>
        <tr><th>Dates</th><td>${formatDate(params.pickupDate)} to ${formatDate(params.returnDate)}</td></tr>
        <tr><th>Current Status</th><td>${params.currentStatus}</td></tr>
      </table>
      <p>Please review and process the cancellation in the admin dashboard.</p>
      `
    );

    await resend.emails.send({
      from: `JP Rentals <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `[JP Rentals] Cancellation Request: ${params.bookingRef}`,
      html,
    });
  } catch (error) {
    console.error('Failed to send admin cancellation request email:', error);
  }
}
