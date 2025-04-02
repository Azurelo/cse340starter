const pool = require('../database/'); 

// Add a new review
async function addReview(reviewText, invId, accountId) {
    const sql = `INSERT INTO review (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *`;
    const result = await pool.query(sql, [reviewText, invId, accountId]);
    return result.rows[0];
}

// Get all reviews for a specific inventory item
async function getReviewsByInventoryId(invId) {
    const sql = `SELECT r.review_text, a.account_firstname, r.review_date 
                 FROM review r 
                 JOIN account a ON r.account_id = a.account_id 
                 WHERE r.inv_id = $1 
                 ORDER BY r.review_date DESC`;
    const result = await pool.query(sql, [invId]);
    return result.rows;
  }  

// Get all reviews by a specific account
async function getReviewsByAccountId(accountId) {
    const sql = `SELECT review_id, review_text, inv_id FROM review WHERE account_id = $1`;
    const result = await pool.query(sql, [accountId]);
    return result.rows;
}

// Update a review
async function updateReview(reviewId, newText) {
    const sql = `UPDATE review SET review_text = $1 WHERE review_id = $2 RETURNING *`;
    const result = await pool.query(sql, [newText, reviewId]);
    return result.rows[0];
}

// Delete a review
async function deleteReview(reviewId) {
    const sql = `DELETE FROM review WHERE review_id = $1 RETURNING *`;
    const result = await pool.query(sql, [reviewId]);
    return result.rows[0];
}

module.exports = { addReview, getReviewsByInventoryId, getReviewsByAccountId, updateReview, deleteReview };
