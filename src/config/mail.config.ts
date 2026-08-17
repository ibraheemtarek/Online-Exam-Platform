import nodemailer from "nodemailer";
import { EMAIL_HOST, EMAIL_PASS, EMAIL_USER } from "./env.variables.js";

//create transport
const transport = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export default transport;
