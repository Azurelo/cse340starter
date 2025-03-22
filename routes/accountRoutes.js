const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')
const Util = require('../utilities/index')
// Route to display login view
router.get("/login", regValidate.handleErrors(accountController.buildLogin));
router.get("/register", regValidate.handleErrors(accountController.buildRegister));
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  regValidate.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  regValidate.handleErrors(accountController.accountLogin)
)
router.get('/logout', regValidate.handleErrors(accountController.logout));

router.get("/", Util.checkJWTToken, Util.checkLogin, regValidate.handleErrors(accountController.buildAccountManagement));

// Route for account update page
router.get('/update/:id', regValidate.handleErrors(accountController.buildUpdateAccountPage)); 

// Route to handle the update form submission
router.post('/update', regValidate.handleErrors(accountController.updateAccount)); 
// In your accounts router file

module.exports = router;
