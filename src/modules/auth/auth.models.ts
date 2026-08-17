import { Schema, Types, model } from "mongoose";
import { UserRole } from "./auth.dto.js";

export interface Auth {
  _id?: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  passwordHash: string;
  role: UserRole;
  token?: string;
  resetToken?: string;
  resetTokenDate?: Date;
}
const AuthSchema = new Schema<Auth>(
  {
    firstName: { type: String, require: true },
    lastName: { type: String, require: true },
    email: { type: String, unique: true, require: true },
    image: { type: String, required: true },
    passwordHash: { type: String, require: true },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },

    token: { type: String },
    resetToken: { type: String },
    resetTokenDate: { type: Date },
  },
  {
    timestamps: true,
  },
);

const AuthModel = model<Auth>("AuthModel", AuthSchema);
export default AuthModel;
