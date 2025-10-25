import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Verification from "../models/verification.js";
import { sendEmail } from "../libs/sendEmail.js";
import aj from "../libs/arcjet.js";

export const registerUser = async (req, res) => {
    try{
const {email, name, password }=req.body;

   const decision = await aj.protect(req, { email ,  requested: 1});
    console.log("Arcjet decision", decision.reason);
//decision.isDenied() → checks if any rule blocked the request.
if (decision.isDenied()) {

// 1️⃣ Handle email validation blocks ,decision.reason.isEmail() → returns true only if the email validation rule triggered.
if (decision.reason.isEmail()) {
  const emailTypes = decision.reason.emailTypes || [];

  if (emailTypes.includes("DISPOSABLE")) {
    return res.status(403).json({ message: "Disposable email not allowed" });
  }
  if (emailTypes.includes("INVALID")) {
    return res.status(403).json({ message: "Invalid email address" });
  }
  if (emailTypes.includes("NO_MX_RECORDS")) {
    return res.status(403).json({ message: "Email domain has no MX records" });
  }

  // fallback for any other email type
  return res.status(403).json({ message: "Invalid email address" });
}

// 2️⃣ Handle bot blocks
if (decision.reason.isBot()) {
  return res.status(403).json({ message: "Bot traffic blocked" });
}

// 3️⃣ Handle rate limiting
if (decision.reason.isRateLimit()) {
  return res.status(429).json({ message: "Too many requests, please try again later" });
}

// 4️⃣ Handle shield blocks
if (decision.reason.isShield()) {
  return res.status(403).json({ message: "Request blocked for security reasons" });
}

// 5️⃣ Fallback for any other unknown denial reason
return res.status(403).json({ message: "Request blocked", reason: decision.reason });
}


// Check if a user with the same email already exists
const existingUser=await User.findOne({email})
if(existingUser){
        return res.status(400).json({
        message: "Email address already in use",
      });
}

 // Hash the password securely before storing
const salt= await bcrypt.genSalt(10);
//Combines password + salt, then hashes it multiple times (10 rounds)
    const hashPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
      email,
      password: hashPassword,
      name,
    });

    const verificationToken=jwt.sign({userId:newUser._id,purpose:"email-verification"},
      process.env.JWT_SECRET,{expiresIn:"1h"},
    )
    await Verification.create({
      userId: newUser._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
    })

    // send email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;
    const emailSubject = "Verify your email";

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    if (!isEmailSent) {
      return res.status(500).json({
        message: "Failed to send verification email",
      });
    }

    res.status(201).json({
      message:
        "Verification email sent to your email. Please check and verify your account.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Internal server error" });
  }


}
export const loginUser = async (req, res) => {
  try {
    // 1️⃣ Extract email and password from the request body
    const { email, password } = req.body;

    // 2️⃣ Find the user in the database by email
    //    We use .select("+password") because password is usually excluded in the schema
    const user = await User.findOne({ email }).select("+password");

    // 3️⃣ If user does not exist, return an error
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 4️⃣ Check if user's email is verified
    if (!user.isEmailVerified) {

      // 4a️⃣ Find existing verification token for this user
      const existingVerification = await Verification.findOne({
        userId: user._id,
      });

      // 4b️⃣ If a verification exists and has not expired, inform the user
      if (existingVerification && existingVerification.expiresAt > new Date()) {
        return res.status(400).json({
          message:
            "Email not verified. Please check your email for the verification link.",
        });
      } else {
        // 4c️⃣ If existing verification exists but expired, delete it
        if (existingVerification) {
          await Verification.findByIdAndDelete(existingVerification._id);
        }

        // 4d️⃣ Create a new verification token (JWT, expires in 1 hour)
        const verificationToken = jwt.sign(
          { userId: user._id, purpose: "email-verification" },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        // 4e️⃣ Save the verification token to the database
        await Verification.create({
          userId: user._id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
        });

        // 4f️⃣ Prepare the verification email
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;
        const emailSubject = "Verify your email";

        // 4g️⃣ Send the email
        const isEmailSent = await sendEmail(email, emailSubject, emailBody);

        // 4h️⃣ If email sending fails, return 500
        if (!isEmailSent) {
          return res.status(500).json({
            message: "Failed to send verification email",
          });
        }

        // 4i️⃣ Inform the user that verification email has been sent
        return res.status(201).json({
          message:
            "Verification email sent to your email. Please check and verify your account.",
        });
      }
    }

    // 5️⃣ If email is verified, validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // 6️⃣ If password does not match, return error
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 7️⃣ If login successful, generate a JWT token for authentication (expires in 7 days)
    const token = jwt.sign(
      { userId: user._id, purpose: "login" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 8️⃣ Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // 9️⃣ Prepare user data to send in response (remove password) 
    //Convert Mongoose document to plain JS object so you can safely manipulate and send it
    const userData = user.toObject();
    delete userData.password;

    // 🔟 Send successful login response with token and user info
    res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });

  } catch (error) {
    // 1️⃣1️⃣ Catch unexpected errors and return 500
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Controller function to verify a user's email using a token
export const verifyEmail = async (req, res) => {
  try {
    // 1️⃣ Extract the token from the request body
    const { token } = req.body;


    // 2️⃣ Verify the JWT token using the server's secret
    // jwt.verify will throw an error if the token is invalid or expired
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Token expired. Please request a new verification email." });
      } else {
        return res.status(401).json({ message: "Invalid token" });
      }
    }


    // 3️⃣ Check if payload exists (extra safety)
    if (!payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 4️⃣ Destructure userId and purpose from the JWT payload
    const { userId, purpose } = payload;

    // 5️⃣ Ensure this token was issued for email verification
    if (purpose !== "email-verification") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 6️⃣ Look up the verification record in the database
    const verification = await Verification.findOne({
      userId,
      token,
    });

    // 7️⃣ If no matching verification record is found, block request
    if (!verification) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 8️⃣ Check if the verification token has expired
    const isTokenExpired = verification.expiresAt < new Date();
    console.log(isTokenExpired);
    
    if (isTokenExpired) {
      return res.status(401).json({ message: "Token expired" });
    }

    // 9️⃣ Find the user associated with this token
    const user = await User.findById(userId);

    // 🔟 If user not found, block request
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1️⃣1️⃣ If the user already verified their email, return a 400 error
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // 1️⃣2️⃣ Mark the user's email as verified
    user.isEmailVerified = true;
    await user.save(); // Save the change to the database

    // 1️⃣3️⃣ Delete the verification record from DB since it's no longer needed
    await Verification.findByIdAndDelete(verification._id);

    // 1️⃣4️⃣ Send success response
    res.status(200).json({ message: "Email verified successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Controller function to handle reset password request
export const resetPasswordRequest = async (req, res) => {
  try {
    // 1️⃣ Extract the email from request body
    const { email } = req.body;

    // 2️⃣ Find the user in DB using email
    const user = await User.findOne({ email });

    // 3️⃣ If user doesn't exist, stop the flow
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 4️⃣ Ensure that user has verified their email before resetting password
    if (!user.isEmailVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }

    // 5️⃣ Check if there’s already an active reset password request
    const existingVerification = await Verification.findOne({
      userId: user._id,
    });

    // 🔹 Case A: If a reset request already exists and hasn't expired yet
    if (existingVerification && existingVerification.expiresAt > new Date()) {
      return res.status(400).json({
        message: "Reset password request already sent",
      });
    }

    // 🔹 Case B: If request exists but expired, clean it up
    if (existingVerification && existingVerification.expiresAt < new Date()) {
      await Verification.findByIdAndDelete(existingVerification._id);
    }

    // 6️⃣ Create a new reset password JWT token (valid for 15 minutes)
    const resetPasswordToken = jwt.sign(
      { userId: user._id, purpose: "reset-password" }, // payload
      process.env.JWT_SECRET,                         // secret
      { expiresIn: "15m" }                            // expiration
    );

    // 7️⃣ Store this token in the Verification collection with expiry time
    await Verification.create({
      userId: user._id,
      token: resetPasswordToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min from now
    });

    // 8️⃣ Construct the reset password link for frontend
    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;

    // 9️⃣ Prepare email body and subject
    const emailBody = `<p>Click <a href="${resetPasswordLink}">here</a> to reset your password</p>`;
    const emailSubject = "Reset your password";

    // 🔟 Send the reset password email
    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    // 1️⃣1️⃣ If email sending fails
    if (!isEmailSent) {
      return res.status(500).json({
        message: "Failed to send reset password email",
      });
    }

    // 1️⃣2️⃣ Success response
    res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    // 1️⃣3️⃣ Handle unexpected server errors
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller function: Verify reset password token and update the password
export const verifyResetPasswordTokenAndResetPassword = async (req, res) => {
  try {
    // 1️⃣ Extract token and passwords from request body
    const { token, newPassword, confirmPassword } = req.body;

    // 2️⃣ Verify the JWT token with your secret
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ If token is invalid (not decodable or tampered with)
    if (!payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 4️⃣ Extract data from payload
    const { userId, purpose } = payload;

    // 5️⃣ Ensure token purpose is specifically "reset-password"
    if (purpose !== "reset-password") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 6️⃣ Find token record in Verification collection (must exist in DB too)
    const verification = await Verification.findOne({
      userId,
      token,
    });

    if (!verification) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 7️⃣ Check if token has expired
    const isTokenExpired = verification.expiresAt < new Date();
    if (isTokenExpired) {
      return res.status(401).json({ message: "Token expired" });
    }

    // 8️⃣ Find the user associated with the token
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 9️⃣ Validate password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // 🔟 Hash the new password securely with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    // 1️⃣1️⃣ Save the new hashed password to user
    user.password = hashPassword;
    await user.save();

    // 1️⃣2️⃣ Delete the used verification token (prevent reuse)
    await Verification.findByIdAndDelete(verification._id);

    // 1️⃣3️⃣ Send success response
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    // 1️⃣4️⃣ Handle unexpected errors
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
