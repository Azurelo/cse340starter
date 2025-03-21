const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation')
const Util = require('../utilities/index')
// Route to display login view
router.get("/login", accountController.buildLogin);
router.get("/register", accountController.buildRegister);
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  accountController.registerAccount
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  regValidate.handleErrors(accountController.accountLogin)
)
router.get('/account/logout', accountController.logout);

router.get("/", Util.checkJWTToken, Util.checkLogin, regValidate.handleErrors(accountController.buildAccountManagement));
module.exports = router;
