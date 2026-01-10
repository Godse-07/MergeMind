export const signUpEmailTemplate = ({ otp }) => {
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; background: #f3f4f6; padding: 40px 0; margin: 0;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 24px; color: #fff; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">🧠 MergeMind</h1>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">
            Verify Your Account
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px;">
          <h2 style="color: #111827; margin-top: 0; font-size: 20px;">
            Welcome to MergeMind! 🎉
          </h2>
          
          <p style="font-size: 15px; color: #374151; line-height: 1.6;">
            Thank you for signing up for <b>MergeMind</b>.
            <br/>
            To complete your registration and activate your account, please use the OTP below:
          </p>

          <!-- OTP Box -->
          <div style="
            margin: 25px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            text-align: center;
          ">
            <p style="
              font-size: 32px;
              letter-spacing: 6px;
              margin: 0;
              font-weight: 700;
              color: #1e40af;
            ">
              ${otp}
            </p>
            <p style="margin: 12px 0 0; font-size: 14px; color: #6b7280;">
              This code is valid for <b>10 minutes</b>.
            </p>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
            If you did not create a MergeMind account, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            Sent by <b>MergeMind AI</b> 🚀 <br/>
            <span style="font-size: 12px;">
              &copy; 2026 MergeMind — Intelligent code analysis made simple.
            </span>
          </p>
        </div>
      </div>
    </div>
  `;
};
