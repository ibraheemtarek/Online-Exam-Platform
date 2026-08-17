import AuthModel from "./auth.models.js";
import { hashSync, compareSync } from "bcrypt-ts";
import { generateWebToken } from "../../common/utils/jwt.utils.js";
import type { SignupDTP, SigninDTP, UserRole } from "./auth.dto.js";
import { unauthorizedExceptionError } from "../../common/errors/domain.exceptions.js";
import CustomError from "../../common/errors/custom.error.js";
import { sendResetTokenToUser } from "../../common/utils/mail.service.js";
import { SALT_ROUNDS } from "../../config/env.variables.js";
import { randomBytes } from "node:crypto";

export const AuthSigninService = async (
  user: SigninDTP,
): Promise<SigninDTP | {}> => {
  const existUser = await AuthModel.findOne({ email: user.email });
  if (!existUser) {
    throw new unauthorizedExceptionError();
  } else {
    const vlaidPass = compareSync(user.passwordHash, existUser.passwordHash);
    if (vlaidPass) {
      return {
        _id: existUser._id,
        firstName: existUser.firstName,
        lastName: existUser.lastName,
        email: existUser.email,
        image: existUser.image,
        passwordHash: existUser.passwordHash,
        role: existUser.role,
        token: generateWebToken({
          userId: existUser._id.toString(),
          email: existUser.email,
          role: existUser.role,
        }),
      };
    } else {
      throw new CustomError("invalid password", 401);
    }
  }
};

export const AuthSignupService = async (
  user: SignupDTP,
): Promise<SignupDTP | {}> => {
  const { firstName, lastName, email, image, passwordHash, role } = user;

  const existUser = await AuthModel.findOne({ email });

  if (existUser) throw new CustomError("Email already exists", 409);

  const newUser = await AuthModel.create({
    firstName,
    lastName,
    email,
    image,
    passwordHash: hashSync(passwordHash, SALT_ROUNDS),
    role,
  });
  if (!newUser) {
    throw new CustomError("creation user operation not success", 400);
  } else {
    return newUser;
  }
};

export const AuthForgetPasswordService = async (email: string) => {
  if (!email) throw new CustomError("The email is required", 400);

  const user = await AuthModel.findOne({ email });
  if (!user) throw new CustomError("This email not found", 404);

  //create Rest Token
  const resetToken = randomBytes(32).toString("hex");
  //set the resetToken for the exist user
  user.resetToken = hashSync(resetToken, 10);
  user.resetTokenDate = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();
  console.log(user.resetTokenDate);
  // Send Reset Token to user on his email
  sendResetTokenToUser(user.email, user.resetToken);

  return user;
};

export const AuthResetPasswordService = async (resetToken: string) => {};
