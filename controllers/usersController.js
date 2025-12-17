import { verify } from 'crypto';
import sendEmail from '../logging/mail.js';
import {User, Inventory, Cart, Item} from '../models/index.js';
import bcrypt from 'bcrypt';
import logger from '../logging/logger.js';
import disposableDomains from "disposable-email-domains";



function isDisposable(email) {
  const domain = email.split("@")[1].toLowerCase();
  return disposableDomains.includes(domain);
}


// Registrierung
async function registerUser(req, res) {
  try {
    //Check if user already exists
    const existingUser = await User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      return  res.status(408).json({ error: 'Email is already registered' });
    }

    if (isDisposable(req.body.email)) {
      return res.status(410).json({ error: 'Disposable email addresses are not allowed' });
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
    const htmlEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Welcome to EraSwap</title>
</head>

<body style="
  margin:0;
  padding:0;
  background-color:#F2FFE8;
  font-family: Arial, Helvetica, sans-serif;
  color:#222629;
">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:48px 16px;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="
          max-width:520px;
          background:#FFFFFF;
          border-radius:16px;
          padding:40px 32px;
        ">

          <!-- Title -->
          <tr>
            <td style="text-align:center;">
              <h1 style="
                margin:0;
                font-size:32px;
                font-weight:600;
                letter-spacing:0.5px;
                color:#222629;
              ">
                Welcome to EraSwap
              </h1>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="
              padding-top:16px;
              font-size:16px;
              line-height:1.6;
              color:#474B4F;
            ">
              <p style="margin:0;">
                Thanks for joining EraSwap.  
                To get started, please verify your account using the code below.
              </p>
            </td>
          </tr>

          <!-- Verification Code -->
          <tr>
            <td align="center" style="padding:32px 0;">
              <div style="
                display:inline-block;
                padding:16px 28px;
                border-radius:12px;
                background:#ECFEEB;
                color:#61892F;
                font-size:26px;
                font-weight:600;
                letter-spacing:6px;
              ">
                ${code}
              </div>
            </td>
          </tr>

          <!-- Helper text -->
          <tr>
            <td style="
              font-size:14px;
              line-height:1.6;
              color:#6B6E70;
            ">
              <p style="margin:0;">
                The code is valid for a limited time.  
                If you didn’t create an EraSwap account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding-top:32px;
              border-top:1px solid #DFF4CF;
              font-size:13px;
              color:#6B6E70;
            ">
              <p style="margin:0;">
                — The EraSwap Team<br />
                Connecting students, reducing waste.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;
    await sendEmail(
      'Verify your account',
      htmlEmail,
      newUser.email, 'Eraswap'
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
    console.log('Verification request received:', req.body);
    const { email, code } = req.body;
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
    console.log('Login request received:', req.body);
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
      const code = generate5DigitCode();
      user.verification_code = code;
      await user.save();
      sendEmail(
        'Verify your account',
        `Your verification code is: ${user.verification_code}`,
        user.email, 'Eraswap Support'
      );
      console.log('User not verified, verification email resent.');
      return res.status(409).json({ error: 'User not verified. Please check your email for the verification code.', email: user.email });
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

async function getUserListings(req, res) {
    try {
        const { userid } = req.params;
    // Return all items where the foreign key `listedbyid` matches the user id
    const items = await Item.findAll({ where: { listedbyid: userid } });
    // If you want to ensure the user exists, uncomment the block below
    // const user = await User.findOne({ where: { id: userid } });
    // if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(items);
    } catch (err) {
        console.error('Get user listings error:', err);
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
    if (!user) return res.status(404).json({ error: 'User not found' });
    console.log(`Adding ${amount} exp to user ${userid} (current exp: ${user.exp})`);
    user.exp += amount;
    user.save();
    res.status(200).json({ exp: user.exp });
  } catch (err) {
    console.error('Add user exp error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function setUserExp(req, res) {
    try {
        const { userid } = req.params;
        const { exp } = req.body;
        const user = await User.findOne({ where: { id: userid } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.exp = exp;
        await user.save();
        res.status(200).json({ exp: user.exp });
    } catch (err) {
        console.error('Set user exp error:', err);
        res.status(500).json({ error: err.message });
    } 
}

async function setUserLevel(req, res) {
    try {
        const { userid } = req.params;
        const { level } = req.body;
        const user = await User.findOne({ where: { id: userid } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.level = level;
        await user.save();
        res.status(200).json({ level: user.level });
    } catch (err) {
        console.error('Set user level error:', err);
        res.status(500).json({ error: err.message });
    } 
}

async function getUserEmmissions(req, res) {
    try {
        const { userid } = req.params;
    console.log('getUserEmmissions: received request for userid=', userid);
        const user = await User.findOne({ where: { id: userid } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        // Emmissions get calculated as all items.weight from all orders by user * 2
    const orders = await user.getOrders({ include: [{ model: Item }] }) || [];
    console.log(`getUserEmmissions: loaded ${orders.length} orders for user ${userid}`);

    // Sum weights defensively: orders or items may be missing/null
    const totalWeight = orders.reduce((orderAcc, order) => {
      const items = order.Items || order.items || [];
      if (!items || items.length === 0) {
        console.log(`getUserEmmissions: order ${order.id} has no items`);
      } else {
        console.log(`getUserEmmissions: order ${order.id} has ${items.length} items`);
      }
      const itemsWeight = items.reduce((itAcc, it) => {
        const w = it && !Number.isNaN(Number(it.weight)) ? Number(it.weight) : 0;
        if (!it) console.log('getUserEmmissions: encountered null/undefined item in order', order.id);
        return itAcc + w;
      }, 0);
      return orderAcc + itemsWeight;
    }, 0);

    // Example calculation: 2x weight -> round to 2 decimals
    const emmissions = Math.round((totalWeight * 2 + Number.EPSILON) * 100) / 100;
    console.log(`getUserEmmissions: totalWeight=${totalWeight}, emmissions=${emmissions}`);
    res.status(200).json({ totalEmmissions: emmissions });
    } catch (err) {
        console.error('Get user emmissions error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function getOrderEmmissions(req, res) {
    try {
        const { userid, orderid } = req.params;
        console.log('getOrderEmmissions: received request for userid=', userid, 'orderid=', orderid);
        const user = await User.findOne({ where: { id: userid } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        // `User.hasMany(Order)` generates `getOrders` (plural). Use it with a where-clause
        const orders = await user.getOrders({ where: { id: orderid }, include: [{ model: Item }] }) || [];
        const order = orders[0];
        if (!order) {
          console.log(`getOrderEmmissions: order ${orderid} not found for user ${userid}`);
          return res.status(404).json({ error: 'Order not found' });
        }
        // Emmissions get calculated as all items.weight from the specific order * 2
        const items = order.Items || order.items || [];
        console.log(`getOrderEmmissions: loaded ${items.length} items for order ${orderid}`);
        const totalWeight = items.reduce((itAcc, it) => {
            const w = it && !Number.isNaN(Number(it.weight)) ? Number(it.weight) : 0;
            if (!it) console.log('getOrderEmmissions: encountered null/undefined item in order', order.id);
            return itAcc + w;
        }, 0);
        // Example calculation: 2x weight -> round to 2 decimals
        const emmissions = Math.round((totalWeight * 2 + Number.EPSILON) * 100) / 100;
        console.log(`getOrderEmmissions: totalWeight=${totalWeight}, emmissions=${emmissions}`);
        res.status(200).json({ totalEmmissions: emmissions });
    } catch (err) {
        console.error('Get user emmissions error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function checkUsernameAvailability(req, res) {
    try {
        const { username } = req.params;
        const user = await User.findOne({ where: { username } });
        const exists = user;
        logger.info(`Check username availability for '${username}': ${exists ? 'exists' : 'available'}`);
        res.status(200).json({ exists });
    } catch (err) {
        console.error('Check username availability error:', err);
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
    verifyUser,
    getUserListings,
    setUserExp,
    setUserLevel,
    getUserEmmissions,
    getOrderEmmissions,
    checkUsernameAvailability
};
