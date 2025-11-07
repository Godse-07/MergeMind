const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail({ to, subject, html }) {
  try {
    const response = await resend.emails.send({
      from: "MergeMind <no-reply@mergemind.me>",
      to,
      subject,
      html,
    });

    const messageId =
      response?.data?.id || response?.id || response?.message || "no-id";

    console.log(`📧 Email sent successfully to ${to} → ${messageId}`);
    return response;
  } catch (error) {
    console.error("❌ Failed to send email:", error?.message || error);
    throw error;
  }
}

module.exports = sendMail;
