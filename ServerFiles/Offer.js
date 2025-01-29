


const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
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
  agent: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true }
  },
  offerAmount: { type: Number, required: true },
  buyingDate: { type: Date, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  paymentTransactionId: { type: String }
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = (app) => {
  app.post('/api/offers', async (req, res) => {
    const { user, property, offerAmount, buyingDate } = req.body;

    if (offerAmount < property.priceRange.min || offerAmount > property.priceRange.max) {
      return res.status(400).json({ message: `Offer amount must be between ${property.priceRange.min} and ${property.priceRange.max}` });
    }

    try {
      const offer = new Offer({
        user,
        propertyId: property.propertyId,
        title: property.title,
        location: property.location,
        image: property.image,
        agent: property.agent,
        offerAmount,
        buyingDate,
        status: 'pending',
      });

      await offer.save();
      res.status(201).json({ message: 'Offer made successfully.' });
    } catch (error) {
      console.error('Error making offer:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/offers/:userId', async (req, res) => {
    try {
      const offers = await Offer.find({ 'user.userId': req.params.userId });
      res.json(offers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/offers/:offerId/payment', async (req, res) => {
    const { paymentTransactionId, status } = req.body;

    try {
      const offer = await Offer.findById(req.params.offerId);
      if (!offer) {
        return res.status(404).json({ message: 'Offer not found' });
      }

      offer.paymentTransactionId = paymentTransactionId;
      offer.status = status;
      await offer.save();

      res.status(200).json({ message: 'Payment status updated successfully' });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/agent/offers/:agentEmail', async (req, res) => {
    try {
      const offers = await Offer.find({ 'agent.email': req.params.agentEmail });
      res.json(offers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/agent/offers/:offerId/accept', async (req, res) => {
    try {
      const offer = await Offer.findById(req.params.offerId);
      if (!offer) {
        return res.status(404).json({ message: 'Offer not found' });
      }

      offer.status = 'accepted';
      await offer.save();

      await Offer.updateMany(
        { propertyId: offer.propertyId, _id: { $ne: offer._id } },
        { $set: { status: 'rejected' } }
      );

      res.status(200).json({ message: 'Offer accepted successfully' });
    } catch (error) {
      console.error('Error accepting offer:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/agent/offers/:offerId/reject', async (req, res) => {
    try {
      const offer = await Offer.findById(req.params.offerId);
      if (!offer) {
        return res.status(404).json({ message: 'Offer not found' });
      }

      offer.status = 'rejected';
      await offer.save();

      res.status(200).json({ message: 'Offer rejected successfully' });
    } catch (error) {
      console.error('Error rejecting offer:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/agent/sold/:agentEmail', async (req, res) => {
    try {
      const soldProperties = await Offer.find({ 'agent.email': req.params.agentEmail, status: 'bought' });
      res.json(soldProperties);
    } catch (error) {
      console.error('Error fetching sold properties:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};