const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const utilities = require('../utilities/account-validation');
//Routes for /reviews
router.post('/add', utilities.handleErrors(reviewController.addReview));
router.get('/inventory/:inv_id', utilities.handleErrors(reviewController.displayReviews));
router.get('/edit/:review_id', utilities.handleErrors(reviewController.editReviewForm));
router.post('/edit/:review_id', utilities.handleErrors(reviewController.editReview));
router.post('/delete/:review_id', utilities.handleErrors(reviewController.deleteReview));

module.exports = router;
