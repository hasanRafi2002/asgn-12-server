



const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const propertySchema = new mongoose.Schema({
  propertyId: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  priceRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  agent: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true }
  },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);

module.exports = (app) => {
  app.post('/api/properties', async (req, res) => {
    const { title, location, description, image, priceRange, agent } = req.body;

    if (!title || !location || !description || !image || !priceRange || !agent) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newProperty = new Property({
      propertyId: uuidv4(),
      title,
      location,
      description,
      image,
      priceRange,
      agent
    });

    try {
      await newProperty.save();
      res.status(201).json({ message: 'Property added successfully', property: newProperty });
    } catch (err) {
      console.error('Error adding property:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  app.get('/api/properties/:agentEmail', async (req, res) => {
    const { agentEmail } = req.params;

    try {
      const properties = await Property.find({ 'agent.email': agentEmail });
      res.json(properties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/properties/status/:status', async (req, res) => {
    const { status } = req.params;

    try {
      const properties = await Property.find({ status });
      res.json(properties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/properties/by-propertyid/:propertyId', async (req, res) => {
    const { propertyId } = req.params;
    console.log(`Received request for property with propertyId: ${propertyId}`);

    try {
      const property = await Property.findOne({ propertyId: propertyId });
      if (!property) {
        console.log('Property not found');
        return res.status(404).json({ message: 'Property not found' });
      }
      console.log('Property found:', property);
      res.json(property);
    } catch (err) {
      console.error('Error fetching property:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/properties', async (req, res) => {
    try {
      const properties = await Property.find();
      res.json(properties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/properties/:id', async (req, res) => {
    const { id } = req.params;
    const { title, location, image, priceRange } = req.body;

    try {
      const property = await Property.findByIdAndUpdate(id, {
        title,
        location,
        image,
        priceRange
      }, { new: true });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      res.status(200).json({ message: 'Property updated successfully', property });
    } catch (err) {
      console.error('Error updating property:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Define the more specific route first
  app.delete('/api/properties/by-propertyid/:propertyId', async (req, res) => {
    const { propertyId } = req.params;

    try {
      const property = await Property.findOneAndDelete({ propertyId });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      res.status(200).json({ message: 'Property deleted successfully' });
    } catch (err) {
      console.error('Error deleting property:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Define the more general route after
  app.delete('/api/properties/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const property = await Property.findByIdAndDelete(id);

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      res.status(200).json({ message: 'Property deleted successfully' });
    } catch (err) {
      console.error('Error deleting property:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/properties/verify/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const property = await Property.findByIdAndUpdate(id, { status: 'verified' }, { new: true });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      res.status(200).json({ message: 'Property verified successfully', property });
    } catch (err) {
      console.error('Error verifying property:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.put('/api/properties/reject/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const property = await Property.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });

      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      res.status(200).json({ message: 'Property rejected successfully', property });
    } catch (err) {
      console.error('Error rejecting property:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
};