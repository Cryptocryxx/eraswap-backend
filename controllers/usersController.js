import { verify } from 'crypto';
import sendEmail from '../logging/mail.js';
import {User, Inventory, Cart} from '../models/index.js';
import bcrypt from 'bcrypt';
import { send } from 'process';
import { Console } from 'console';

// Registrierung
async function registerUser(req, res) {
  try {
    //Check if user already exists
    const existingUser = await User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      return  res.status(408).json({ error: 'Email is already registered' });
    }

    const { username, email, password, firstName, lastName, birthday, role } = req.body;
    console.log(req.body);
    console.log(username, email, password, firstName, lastName, birthday);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const newUser = await User.create({
      username,
      firstName,
      lastName,
      email,
      password_hash: hashedPassword,
      birthday,
      role: role || 'user'
    });

     // Create Inventory and Cart for the new user
    await Inventory.create({ user_id: newUser.id });
    await Cart.create({ user_id: newUser.id });

    const code = generate5DigitCode();
    // Here you would typically save the verification code to the database associated with the user
    newUser.verification_code = code;
    await newUser.save();
    
    // Send verification email
    await sendEmail(
      'Verify your account',
      `Your verification code is: ${code}`,
      newUser.email, 'Eraswap Support'
    );

    res.status(201).json(newUser);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: err.message });
  }
}

function generate5DigitCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

async function verifyUser(req, res) {
  try {
    const { email, code } = req.query;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.verification_code === code) {
      user.verified = true;
      user.verification_code = null; // Clear the code after verification
      await user.save();
      res.status(200).json({ message: 'User verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Login
async function loginUser(req, res) {
  try {

    const { email, username, password } = req.body;
    let user;
    if (!email) {
        user = await User.findOne({ where: { username } });
    } else {
        user = await User.findOne({ where: { email } });
    }
    if (!user) { 
      console.log('User not found for login:', email || username);
      return res.status(404).json({ error: 'User not found' });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {console.log("Invalid Password");  return res.status(401).json({ error: 'Invalid password' });}

    //Check if user is verified
    if (!user.verified) {
      sendEmail(
        'Verify your account',
        `Your verification code is: ${user.verification_code}`,
        user.email, 'Eraswap Support'
      );
      console.log('User not verified, verification email resent.');
      return res.status(409).json({ error: 'User not verified. Please check your email for the verification code.' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.log('Login error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getUserProfile(req, res) {
   try {
    const { userid } = req.params;
    const user = await User.findOne({ where: { id:userid } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
   }catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: err.message });
   }
}

// Benutzerprofil aktualisieren
async function updateUserProfile(req, res) {
    try {
    const { userid } = req.params;
    const updates = req.body;
    console.log('Update payload:', updates);
    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }
    const [updated] = await User.update(updates, { where: { id:userid } });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    const updatedUser = await User.findOne({ where: { id:userid } });
    res.status(200).json(updatedUser);
   } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: err.message });
   }
}

// Benutzer löschen
async function deleteUserAccount(req, res) {
    try {
    const { userid } = req.params;
    console.log('Deleting user with ID:', userid);
    const deleted = await User.destroy({ where: { id:userid } });
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'User deleted' });
   } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: err.message });
   }
}

async function getUserCoins(req, res) {
    try {
        const { userid } = req.params;
        const user = await User.findOne({ where: { id: userid } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ coins: user.coins });
    } catch (err) {
        console.error('Get user coins error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function addUserCoins(req, res) {
    try {
        const { userid } = req.params;
        const { amount } = req.body;
        const user = await User.findOne({ where: { id: userid } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.coins += amount;
        await user.save();
        res.status(200).json({ coins: user.coins });
    } catch (err) {
        console.error('Add user coins error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function getUserLevel(req, res) {
    try {
        const { userid } = req.params;
        const user = await User.findOne({ where: { id: userid } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ level: user.level });
    } catch (err) {
        console.error('Get user level error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function addUserExp(req, res) {
    try {
        const { userid } = req.params;
        const { amount } = req.body;
        const user = await User.findOne({ where: { id: userid } });
        if (!user) return res.status(404).json({  error: 'User not found' });
        user.exp += amount;
        // Level up logic (example: every 100 exp = level up)
        while (user.exp >= 100) {
            user.level += 1;
            user.exp -= 100;
        }
        await user.save();
        res.status(200).json({ level: user.level, exp: user.exp });
    } catch (err) {
        console.error('Add user exp error:', err);
        res.status(500).json({ error: err.message });
    }
}

export default {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUserAccount,
    getUserCoins,
    addUserCoins,
    getUserLevel,
    addUserExp,
    verifyUser
};
