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
router.get('/account/logout', regValidate.handleErrors(accountController.logout));

router.get("/", Util.checkJWTToken, Util.checkLogin, regValidate.handleErrors(accountController.buildAccountManagement));

// Route for account update page
router.get('/account/update:id', regValidate.handleErrors(accountController.buildUpdateAccountPage)); 

// Route to handle the update form submission
router.post('/account/update', regValidate.handleErrors(accountController.updateAccount)); 
// In your accounts router file
router.get('/account/update', (req, res) => {
    if (!req.user) { // If the user is not logged in
        return res.redirect('/login');
    }
    // Render account management page, pass user data
    res.render('account/account-management', { user: req.user });
});

module.exports = router;
