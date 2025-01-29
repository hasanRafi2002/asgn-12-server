

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const reviewSchema = new mongoose.Schema({
  reviewId: { type: String, required: true, unique: true },
  propertyId: { type: String, required: true },
  propertyTitle: { type: String, required: true },
  agent: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true }
  },
  reviewer: {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true }
  },
  reviewText: { type: String, required: true },
  rating: { type: Number, required: true },
  createdAt: { type: Date, required: true }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = (app) => {
  app.post('/api/properties/:propertyId/reviews', async (req, res) => {
    const { propertyId } = req.params;
    const { reviewText, rating, propertyTitle, agent, reviewer } = req.body;

    if (!reviewer || !reviewer.userId) {
      return res.status(400).json({ message: 'Reviewer information is required' });
    }

    try {
      const review = new Review({
        reviewId: uuidv4(),
        propertyId,
        propertyTitle,
        agent,
        reviewer,
        reviewText,
        rating,
        createdAt: new Date().toISOString()
      });

      await review.save();
      res.status(201).json(review);
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/properties/:propertyId/reviews', async (req, res) => {
    const { propertyId } = req.params;

    try {
      const reviews = await Review.find({ propertyId });
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/reviews', async (req, res) => {
    try {
      const reviews = await Review.find();
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/reviews/:reviewId', async (req, res) => {
    const { reviewId } = req.params;

    try {
      await Review.findByIdAndDelete(reviewId);
      res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/reviews/:reviewerEmail', async (req, res) => {
    const { reviewerEmail } = req.params;

    try {
      const reviews = await Review.find({ 'reviewer.email': reviewerEmail });
      res.json(reviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
};