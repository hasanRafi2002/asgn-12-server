



const jwt = require('jsonwebtoken');
const Joi = require('joi');
const admin = require('firebase-admin');

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = (app) => {
  app.post('/api/auth/register', async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password } = req.body;

    try {
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: name,
      });

      res.status(201).json({ message: 'User registered successfully', user: userRecord });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;

    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      if (!userRecord) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: userRecord.uid, name: userRecord.displayName, email: userRecord.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

      res.status(200).json({ token, user: { id: userRecord.uid, name: userRecord.displayName, email: userRecord.email } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    try {
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      console.error('Logout error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/auth/profile', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token from client:', token);

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const userRecord = await admin.auth().getUser(decodedToken.id);
      if (!userRecord) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = {
        id: userRecord.uid,
        name: userRecord.displayName || 'Unknown',
        email: userRecord.email,
      };
      console.log('Authenticated user:', user);
      res.status(200).json(user);
    } catch (err) {
      console.error('Token verification failed:', err.code || err.message);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired. Please refresh your token.' });
      }
      return res.status(403).json({ message: 'Invalid token. Authentication failed.' });
    }
  });
};