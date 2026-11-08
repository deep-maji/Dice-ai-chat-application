import httpStatus from "http-status";
import Users from "../models/users.model.js";
import Session from "../models/sessions.model.js";
import OtpModel from "../models/otp.model.js";
import crypto from "crypto"
import bcrypt from "bcrypt";
import config from "../config/config.js";
import ExpressError from "../utils/ExpressError.js";
import { sendEmail } from "../services/mail.service.js";
import { genarateOTP, getOptHTML } from "../utils/genOpt.js";
import { genAccessToken, genRefreshToken, verifyToken, getJWTdecodeData } from "../utils/jwt.util.js";

const register = async (req, res, next) => {
  // Required informations
  if (!req.body) {
    throw new ExpressError(httpStatus.UNAUTHORIZED, "Missing Credentials");
  }

  let { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    throw new ExpressError(httpStatus.UNAUTHORIZED, "Missing Credentials");
  }

  // checking user exist or not
  const existUser = await Users.findOne({ email });
  if (existUser) {
    return res.status(httpStatus.FOUND).json({ message: "Email is already registered!" });
  }

  const SALT = config.SALT;
  const hashPassword = await bcrypt.hash(password, SALT);

  const user = new Users({
    fullname,
    email,
    password: hashPassword
  });

  await user.save();

  // const otp = genarateOTP();
  // const html = getOptHTML(otp);

  // const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  // const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  // await OtpModel.create({
  //   email,
  //   user: user._id,
  //   otpHash,
  //   expiresAt
  // })

  // await sendEmail(email, "OTP Verification", `Your OTP is ${otp}`, html);

  const payload = {
    id: user._id,
    email: user.email,
    verified: user.verified,
    fullname: user.fullname
  };
  const refreshToken = genRefreshToken(payload);
  const hashRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

  await Session.create({
    user: user._id,
    refreshTokenHash: hashRefreshToken,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  const accessToken = genAccessToken(payload);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/"
  });

  res.status(httpStatus.CREATED).json(
    {
      message: "User registered successfully!",
      user: {
        fullname: user.fullname,
        email: user.email,
        verified: user.verified
      },
      accessToken
    });
}

const login = async (req, res, next) => {
  if (!req.body) {
    throw new ExpressError(httpStatus.UNAUTHORIZED, "Missing Credentials");
  }
  const { email, password } = req?.body;
  if (!email || !password) {
    throw new ExpressError(httpStatus.UNAUTHORIZED, "Missing Credentials");
  }

  const user = await Users.findOne({ email });

  // user not exsit
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({ message: "Invaild email or User do not exsits" });
  }

  // isuser verfired ?
  if (!user.verified) {
    const otp = genarateOTP();
    const html = getOptHTML(otp);

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await OtpModel.create({
      email,
      user: user._id,
      otpHash,
      expiresAt
    })

    await sendEmail(email, "OTP Verification", `Your OTP is ${otp}`, html);

    return res.status(httpStatus.FORBIDDEN).json({
      message: "Email is not verified ( OTP send to your registered email. )",
      user: {
        fullname: user.fullname,
        email,
        verified: user.verified
      }
    });
  }

  // comparing hash and normal text password 
  const checkUser = await bcrypt.compare(password, user.password);
  // checking password is match or not
  if (checkUser) {
    const payload = {
      id: user._id,
      email,
      verified: user.verified,
      fullname: user.fullname
    }

    const refreshToken = genRefreshToken(payload);

    const hashRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");


    await Session.create({
      user: user._id,
      refreshTokenHash: hashRefreshToken,
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    })

    const accessToken = genAccessToken(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    return res.status(httpStatus.OK).json({ message: "Loged In!", user: { fullname: user.fullname, email, verified: user.verified }, accessToken });
  }
  else {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: "User not exist or invaild password" });
  }
}

const refreshTokenToAccessToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ExpressError(httpStatus.UNAUTHORIZED, { message: "Refresh Token not found!" });
  }

  const hashRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

  const session = await Session.findOne({
    refreshTokenHash: hashRefreshToken,
    revoked: false
  })

  if (!session) {
    throw new ExpressError(httpStatus.UNAUTHORIZED, "Session not found!");
  }

  try {
    const decode = getJWTdecodeData(refreshToken);

    const accessToken = genAccessToken({ id: decode.id, email: decode.email, verified: decode.verified, fullname: decode.fullname });

    res.status(httpStatus.OK).json({ message: "Token refresh by refresh token", user: { fullname: decode.fullname, email: decode.email, verified: decode.verified }, accessToken });
  } catch (error) {
    next(new ExpressError(httpStatus.BAD_REQUEST, error.message));
  }
}

// const refreshTokenToAccessToken = async (req, res, next) => {
//   const refreshToken = req.cookies.refreshToken;

//   if (!refreshToken) {
//     throw new ExpressError(httpStatus.UNAUTHORIZED, { message: "Refresh Token not found!" });
//   }

//   const hashRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

//   const session = await Session.findOne({
//     refreshTokenHash: hashRefreshToken,
//     revoked: false
//   })

//   if (!session) {
//     throw new ExpressError(httpStatus.UNAUTHORIZED, "Session not found!");
//   }

//   try {
//     const decode = getJWTdecodeData(refreshToken);

//     // const newrefreshToken = genRefreshToken({ id: decode.id, email: decode.email });

//     // const newrefreshTokenHash = crypto.createHash("sha256").update(newrefreshToken).digest("hex");

//     // session.refreshTokenHash = newrefreshTokenHash;
//     // await session.save();

//     const accessToken = genAccessToken({ id: decode.id, email: decode.email });

//     // res.cookie("refreshToken", newrefreshToken, {
//     //   httpOnly: true,
//     //   secure: true,
//     //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7Days
//     // })

//     res.status(httpStatus.OK).json({ message: "Token refresh by refresh token", accessToken });
//   } catch (error) {
//     next(new ExpressError(httpStatus.BAD_REQUEST, error.message));
//   }
// }

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ExpressError(401, "Refresh Token is not found!");
  }

  const hashRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

  const session = await Session.findOne({
    refreshTokenHash: hashRefreshToken,
    revoked: false
  })

  if (!session) {
    throw new ExpressError(httpStatus.BAD_REQUEST, "Session is not found!");
  }

  session.revoked = true;
  await session.save();

  // delete the saved session
  // await Session.deleteOne({
  //   refreshTokenHash: hashRefreshToken,
  //   revoked: true
  // });

  res.clearCookie("refreshToken");

  res.status(httpStatus.OK).json({ message: "Logout successfully!" });
}

const logoutAll = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ExpressError(httpStatus.UNAUTHORIZED, "Refresh Token not found!");
  }

  const decode = getJWTdecodeData(refreshToken);

  await Session.updateMany({
    user: decode.id,
    revoked: false
  }, {
    revoked: true
  })

  // delete the saved sessions
  await Session.deleteMany({
    user: decode.id,
    revoked: true,
  })

  res.clearCookie("refreshToken");

  res.status(httpStatus.OK).json({ message: "Logout from all devices successfully" });
}

const verifyEmail = async (req, res) => {
  const { otp, email } = req.body;

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const otpDoc = await OtpModel.findOne({
    email,
    otpHash,
    expiresAt: { $gt: new Date() } // not expired
  })

  if (!otpDoc) {
    await OtpModel.deleteMany({
      email,
    })
    return res.status(httpStatus.NOT_FOUND).json({ message: "Invaild OTP or expired!" })
  }

  const user = await Users.findById(otpDoc.user);

  if (otpDoc.expiresAt < new Date()) {
    await OtpModel.deleteMany({
      email,
      user: otpDoc.user
    })
    return res.status(httpStatus.BAD_REQUEST).json({ message: "OTP expired!" });
  }

  // const user = await Users.findByIdAndUpdate(otpDoc.user, {
  //   verified: true
  // })

  user.verified = true;
  await user.save();

  await OtpModel.deleteMany({
    email,
    user: otpDoc.user
  })

  res.status(httpStatus.OK).json({ message: "Email Verified!", user: { fullname: user.fullname, email: user.email, verified: user.verified } });
}

const resendOTPforVerifyEmail = async (req, res) => {

  if (!req.body) {
    throw new ExpressError(httpStatus.UNAUTHORIZED, "Missing Credentials");
  }

  const { email } = req?.body;

  if (!email) {
    throw new ExpressError(httpStatus.UNAUTHORIZED, "Missing Credentials");
  }

  const user = await Users.findOne({ email, verified: false });

  if (!user) {
    throw new ExpressError(httpStatus.NOT_FOUND, "User is already verified or not registered!");
  }

  const otp = genarateOTP();
  const html = getOptHTML(otp);

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  await OtpModel.create({
    email,
    user: user._id,
    otpHash,
    expiresAt
  })

  await sendEmail(email, "(Resend) OTP Verification", `Your Resend OTP is ${otp}`, html);

  res.status(httpStatus.OK).json({
    message: "OTP resend successfully!",
    user: {
      email,
      verified: user.verified
    }
  })
}

// TODO - forgetPassword
const forgetPassword = async (req, res) => {

}

// TODO - DeleteAccount
const deleteAccount = async (req, res) => {

}

export {
  register,
  login,
  refreshTokenToAccessToken,
  logout,
  logoutAll,
  verifyEmail,
  resendOTPforVerifyEmail
};