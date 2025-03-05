const bcrypt = require('bcryptjs');
const db = require('../db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:'basivi.manoj955@gmail.com',
    pass:'mwwk nyuf hsht hmhg',// Use an App Password instead of your actual password
  }
})
// Register Controller
const userRegister = async (req, res) => {
  const { fullName, password, email } = req.body;
  console.log(req.body)

  // Validate input
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if user already exists (async version)
    console.log("Checking for existing user...");
    const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    
    console.log("Existing User:", existingUser); // Debugging output
    
    if (existingUser.length > 0) { 
       // Check if any users were found
       console.log("Existing User:", existingUser);
      return res.status(400).json({ message: 'User already exists.' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
     console.log('hashed')
    const newUser = {
      username:fullName,
      email,
      password_hash: hashedPassword, // Store the hashed password
    };
    console.log("newUser:",newUser)

    // Insert new user into the database (async version)
    const [result] = await db.promise().query('INSERT INTO users SET ?', newUser);

    res.status(201).json({ message: 'User registered successfully.' });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Login Controller
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log("req.body:",req.body)

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Check if user exists in the database
    db.execute('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('Error checking user existence:', err.stack);
        return res.status(500).json({ message: 'Server error.' });
      }

      if (results.length === 0) {
        // If no user is found with this email
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      // Get the user from the results
      const user = results[0];

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        // If passwords do not match
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      // If login is successful
      return res.status(200).json({ message: 'Login successful!', userId: user.id });
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


//send Otp
const otpStore={};
const verifiedUsers = {};
const generateOtp = ()=>Math.floor(100000+Math.random()*900000);
const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const [results] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = generateOtp();
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // Store OTP for 10 minutes

    // Email configuration
    const mailOptions = {
      from: 'basivi.manoj955@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP for verification is: ${otp}. It will expire in 10 minutes.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!otpStore[email]) {
      return res.status(400).json({ error: 'OTP not found or expired' });
    }

    const storedOtpData = otpStore[email];

    if (Date.now() > storedOtpData.expiresAt) {
      delete otpStore[email]; // Remove expired OTP
      return res.status(400).json({ error: 'OTP expired' });
    }

    if (storedOtpData.otp !== parseInt(otp)) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    delete otpStore[email]; // OTP is valid, remove it
    verifiedUsers[email] = true; // Mark email as verified

    res.status(200).json({ message: 'OTP verified successfully. You can now reset your password.' });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    if (!verifiedUsers[email]) {
      return res.status(403).json({ error: 'OTP not verified. Please verify OTP first.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the new password

    await db.promise().query('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);

    delete verifiedUsers[email]; // Remove verification flag after successful update

    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};






module.exports = { userRegister,userLogin,sendOtp,verifyOtp ,resetPassword};
