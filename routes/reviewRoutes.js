const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

//Routes for /reviews
router.post('/add', reviewController.addReview);
router.get('/inventory/:inv_id', reviewController.displayReviews);
router.post('/edit', reviewController.editReview);
router.get('/delete/:review_id', reviewController.deleteReview);

module.exports = router;
