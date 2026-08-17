import transport from "../../config/mail.config.js";
import { EMAIL_USER } from "../../config/env.variables.js";

export const sendResetTokenToUser = async (
  email: string,
  resetToken: string,
) => {
  //handle send reset token by mail to user
  const sendMail = transport.sendMail({
    from: EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Reset your password</h2>
        <p>You requested a password reset. Copy the reset token below and put it in verfy code input during 15 minutes.</p>
        <p style="font-body: bold, color : white"> ${resetToken} </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return sendMail;
};
