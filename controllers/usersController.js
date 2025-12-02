import {User, Inventory, Cart} from '../models/index.js';
import bcrypt from 'bcrypt';

// Registrierung
async function registerUser(req, res) {
  try {
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

    res.status(201).json(newUser);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: err.message });
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
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid password' });

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

export default {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUserAccount
};
