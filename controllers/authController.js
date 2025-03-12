import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(8).toString("hex"); // Reduced to 8 bytes
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    const resetLink = `https://password-reset-nit-ui.netlify.app/resetpassword/${resetToken}`;

    await transporter.sendMail({
        to: email,
        subject: "Password Reset",
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
    });

    res.json({ message: "Reset link sent to email" });
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    console.log('Received token:', token);
    console.log('Received password:', password);

    const user = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });

    if (!user) {
        console.log('Invalid or expired token');
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ message: "Password updated successfully" });
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({ name, email, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};