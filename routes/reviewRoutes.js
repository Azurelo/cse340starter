const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

//Routes for /reviews
router.post('/add', reviewController.addReview);
router.get('/inventory/:inv_id', reviewController.displayReviews);
router.get('/edit/:review_id', reviewController.editReviewForm);
router.post('/edit/:review_id', reviewController.editReview);
router.post('/delete/:review_id', reviewController.deleteReview);

module.exports = router;
