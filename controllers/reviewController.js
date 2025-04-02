const reviewModel = require('../models/review-model');

// Add a review
async function addReview(req, res) {
    const { review_text, inv_id, account_id } = req.body;

    if (!review_text || !inv_id || !account_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newReview = await reviewModel.addReview(review_text, inv_id, account_id);
        console.log('New review added:', newReview);
        res.redirect(`/inv/detail/${inv_id}`);
    } catch (error) {
        console.error(error);
        console.error('Failed to add review:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
}

// Display reviews for a vehicle
async function displayReviews(req, res) {
    const { inv_id } = req.params;
    try {
        const reviews = await reviewModel.getReviewsByInventoryId(inv_id);
        res.render('inventoryDetail', { reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve reviews' });
    }
}

// Edit a review
async function editReview(req, res) {
    const { review_id, review_text } = req.body;
    try {
        const updatedReview = await reviewModel.updateReview(review_id, review_text);
        res.redirect('/account/admin');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update review' });
    }
}

// Delete a review
async function deleteReview(req, res) {
    const { review_id } = req.params;
    try {
        await reviewModel.deleteReview(review_id);
        res.redirect('/account/admin');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
}

module.exports = { addReview, displayReviews, editReview, deleteReview };
