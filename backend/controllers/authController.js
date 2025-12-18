// authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import Car from "../models/Car.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Email transporter setup (only if email credentials are provided)
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// Generate email verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
  if (!transporter) {
    console.log('Email not configured. Verification email not sent.');
    return;
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Verify Your Nomotix Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6B4226;">Welcome to Nomotix!</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for signing up with Nomotix. Please verify your email address to activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #6B4226; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">© 2024 Nomotix. All rights reserved.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Step 1: Initial signup - collect basic info and send verification email
export const signup = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email or phone number"
      });
    }

    // Generate email verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store temporary user data in session/cache (for now, we'll use a simple approach)
    // In production, you might want to use Redis or similar
    const tempUserData = {
      name,
      email,
      phone,
      password,
      verificationToken,
      verificationExpires,
      timestamp: Date.now()
    };

    // Store in a temporary collection or cache
    // For simplicity, we'll create a temporary user record
    const tempUser = new User({
      name,
      email,
      phone,
      password: await bcrypt.hash(password, 10),
      authProvider: "local",
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false,
      isActive: false,
      isTemporary: true // Flag to indicate this is a temporary record
    });

    await tempUser.save();

    // Send verification email
    try {
      await sendVerificationEmail(tempUser, verificationToken);
      res.status(200).json({
        message: "Verification email sent! Please check your email and click the verification link to continue.",
        email: email,
        requiresEmailVerification: true,
        step: 'email_verification'
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Clean up temporary user
      await User.findByIdAndDelete(tempUser._id);
      res.status(500).json({
        message: "Failed to send verification email. Please try again.",
        error: emailError.message
      });
    }

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({
      message: "Registration failed. Please try again.",
      error: err.message
    });
  }
};

// Step 2: Complete signup after email verification
export const completeSignup = async (req, res) => {
  const {
    token,
    address,
    carDetails,
    profilePicture,
    dateOfBirth,
    gender
  } = req.body;

  try {
    // Find user by verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
      isTemporary: true
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token"
      });
    }

    // Validate car details if provided
    if (carDetails && carDetails.licensePlate) {
      const existingCar = await Car.findOne({ licensePlate: carDetails.licensePlate });
      if (existingCar) {
        return res.status(400).json({
          message: "A car with this license plate is already registered"
        });
      }
    }

    // Update user with complete information
    user.address = address;
    user.profilePicture = profilePicture;
    user.dateOfBirth = dateOfBirth;
    user.gender = gender;
    user.isEmailVerified = true;
    user.isActive = true;
    user.isTemporary = false;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    const savedUser = await user.save();

    // Create car if details provided
    let savedCar = null;
    if (carDetails) {
      const newCar = new Car({
        owner: savedUser._id,
        ...carDetails
      });
      savedCar = await newCar.save();
    }

    // Generate JWT token for automatic login
    const jwtToken = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: "7d" });

    // Return success response
    const userResponse = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      phone: savedUser.phone,
      address: savedUser.address,
      profilePicture: savedUser.profilePicture,
      isEmailVerified: savedUser.isEmailVerified,
      isActive: savedUser.isActive,
      preferences: savedUser.preferences,
      createdAt: savedUser.createdAt
    };

    res.status(201).json({
      message: "Account created successfully! Welcome to Nomotix.",
      user: userResponse,
      car: savedCar,
      token: jwtToken
    });

  } catch (err) {
    console.error('Complete signup error:', err);
    res.status(500).json({
      message: "Failed to complete registration. Please try again.",
      error: err.message
    });
  }
};

// Verify email address (now just confirms email, doesn't complete signup)
export const verifyEmail = async (req, res) => {
  const { token } = req.query; // Get token from URL query parameter

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
      isTemporary: true
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token"
      });
    }

    // Just mark email as verified, but keep user as temporary
    user.isEmailVerified = true;
    await user.save();

    res.json({
      message: "Email verified successfully! Please complete your registration.",
      verified: true,
      token: token, // Return token for completing signup
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      nextStep: 'complete_signup'
    });

  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({
      message: "Email verification failed. Please try again.",
      error: err.message
    });
  }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    res.json({
      message: "Verification email sent successfully! Please check your inbox."
    });

  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({
      message: "Failed to resend verification email. Please try again.",
      error: err.message
    });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        message: "Account is temporarily locked due to too many failed login attempts. Please try again later."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
      }

      await user.save();
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if account is active (skip email verification check for login)
    if (!user.isActive) {
      return res.status(403).json({
        message: "Account not activated. Please contact support.",
        requiresActivation: true
      });
    }

    // Skip temporary accounts (incomplete signups)
    if (user.isTemporary) {
      return res.status(403).json({
        message: "Please complete your signup process first.",
        requiresSignupCompletion: true
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    // Get user's cars
    const cars = await Car.find({ owner: user._id, isActive: true });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        preferences: user.preferences,
        lastLogin: user.lastLogin
      },
      cars,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

// Google Login (simplified)
export const googleAuth = async (req, res) => {
  const { name, email, googleId } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, googleId, authProvider: "google" });
      await user.save();
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    console.log("token", token);
    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
