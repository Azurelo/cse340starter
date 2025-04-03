const reviewModel = require('../models/review-model');
const utilities = require("../utilities/");
// Add a review
async function addReview(req, res) {
    const { review_text, inv_id, account_id } = req.body;

    if (!review_text || !inv_id || !account_id) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newReview = await reviewModel.addReview(review_text, inv_id, account_id);
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

//Display Edit form
async function editReviewForm(req, res) {
    const { review_id } = req.params;
    let nav = await utilities.getNav();
    try {
        const review = await reviewModel.getReviewById(review_id);
        if (review) {
            res.render('./inventory/edit-review', { review, nav, title: "Edit Review" });
        } else {
            res.status(404).json({ error: 'Review not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load review for editing' });
    }
}


// Edit a review
async function editReview(req, res) {
    const { review_text } = req.body;
    const { review_id } = req.params;
    try {
        const updatedReview = await reviewModel.updateReview(review_id, review_text);

        if (updatedReview) {
            req.flash("success", "Review updated successfully!");
            res.redirect('/account');
        } else {
            req.flash("error", "Review update failed. Please try again.");
            res.redirect(`/reviews/edit/${review_id}`);
        }
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
        res.redirect('/account');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
}

module.exports = { addReview, editReviewForm, displayReviews, editReview, deleteReview };
