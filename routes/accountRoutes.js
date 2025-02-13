const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities"); // Utility functions

// Route to display login view
router.get("/login", accountController.buildLogin);

// Error handler middleware (optional, but recommended)
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

module.exports = router;
