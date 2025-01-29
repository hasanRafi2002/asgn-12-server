



const express = require('express');
const admin = require('./Firebase');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  photoURL: { type: String, default: null },
  role: { type: String, default: 'user' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = (app) => {
  app.post('/api/auth/storeUserData', async (req, res) => {
    const { name, email, role, profileImage, createdAt } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({ name, email, role, photoURL: profileImage, createdAt: new Date(createdAt) });
        await user.save();
      }

      res.status(200).json({ message: 'User data stored successfully', user });
    } catch (err) {
      console.error('Error storing user data:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/user/:email', async (req, res) => {
    try {
      const email = req.params.email;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/user/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
      const user = await User.findByIdAndUpdate(id, { role }, { new: true });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User role updated successfully', user });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/user/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete user from Firebase Authentication
      await admin.auth().getUserByEmail(user.email)
        .then(userRecord => {
          return admin.auth().deleteUser(userRecord.uid);
        })
        .catch(error => {
          console.error('Error deleting user from Firebase:', error);
        });

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/user/:id/fraud', async (req, res) => {
    const { id } = req.params;

    try {
      const user = await User.findByIdAndUpdate(id, { role: 'fraud' }, { new: true });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // TODO: Remove all properties added by this agent

      res.status(200).json({ message: 'User marked as fraud successfully', user });
    } catch (error) {
      console.error('Error marking user as fraud:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};