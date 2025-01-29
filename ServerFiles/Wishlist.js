



const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true }
  },
  propertyId: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, required: true },
  status: { type: String, required: true },
  priceRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  agent: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true }
  }
}, { timestamps: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = (app) => {
  app.post('/api/wishlist', async (req, res) => {
    const { user, property } = req.body;

    if (!user || !property) {
      return res.status(400).json({ message: 'User and property details are required' });
    }

    try {
      // Check if the property is already in the user's wishlist
      const existingWishlistItem = await Wishlist.findOne({ 'user.userId': user.userId, propertyId: property.propertyId });
      if (existingWishlistItem) {
        return res.status(400).json({ message: 'This property is already in your wishlist.' });
      }

      const wishlistItem = new Wishlist({
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          image: user.image
        },
        propertyId: property.propertyId,
        title: property.title,
        location: property.location,
        image: property.image,
        status: property.status,
        priceRange: {
          min: property.priceRange.min,
          max: property.priceRange.max
        },
        agent: {
          name: property.agent.name,
          email: property.agent.email,
          image: property.agent.image
        }
      });

      await wishlistItem.save();
      res.status(201).json({ message: 'Property added to wishlist successfully', wishlistItem });
    } catch (error) {
      console.error('Error adding property to wishlist:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  app.get('/api/wishlist/:userId', async (req, res) => {
    try {
      const wishlistItems = await Wishlist.find({ 'user.userId': req.params.userId });
      res.json(wishlistItems);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/wishlist/:userId/:propertyId', async (req, res) => {
    try {
      await Wishlist.deleteOne({ 'user.userId': req.params.userId, propertyId: req.params.propertyId });
      res.status(200).json({ message: 'Property removed from wishlist successfully.' });
    } catch (error) {
      console.error('Error removing property from wishlist:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/wishlist/:propertyId', async (req, res) => {
    try {
      const { propertyId } = req.params;
      await Wishlist.deleteOne({ propertyId });
      res.status(200).json({ message: 'Property deleted from wishlist successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting property from wishlist' });
    }
  });
};