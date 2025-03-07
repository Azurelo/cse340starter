const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require('bcryptjs');

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    let notice = req.flash("notice"); // Retrieve the flash message

    res.render("account/login", {
      title: "Login",
      nav,
      notice,
      errors: null, 
    });
  } catch (error) {
    next(error);
  }
}
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav();
    console.log('Nav:', nav);  // Add this log to check if the value is returned properly
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildRegister:", error);
    next(error);
  }
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before saving it
  const hashedPassword = await bcrypt.hash(account_password, 10);  // 10 is the salt rounds

  // Log the hashed password to check if it is being generated correctly
  console.log("Hashed Password:", hashedPassword);

  // Pass the hashed password to the model for registration
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword  
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    console.log("Flash message set:", req.flash("notice")); // Debugging

    res.redirect("/account/login"); // Redirect instead of render
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}



/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  const { account_email, account_password } = req.body;

  // Fetch the account data from the database using the email
  const accountData = await accountModel.getAccountByEmail(account_email);

  // Check if account data exists
  if (accountData) {
    // Log the hashed password from the database
    console.log("Hashed Password from DB:", accountData.account_password);

    // Compare the entered password with the hashed password
    console.log('Entered Password:', account_password);
    console.log('Stored Hashed Password:', accountData.account_password);
    const isValidPassword = await bcrypt.compare(account_password, accountData.account_password);
    console.log('Password valid:', isValidPassword);

    // Log the result of the password comparison
    console.log("Password valid:", isValidPassword);

    if (isValidPassword) {
      req.flash("notice", "Login successful!");
      res.redirect("/dashboard"); // Redirect to a protected page
    } else {
      req.flash("notice", "Invalid login credentials.");
      res.status(401).render("account/login", {
        title: "Login",
        errors: null,
        nav
      });
    }
  } else {
    req.flash("notice", "Account not found.");
    res.status(404).render("account/login", {
      title: "Login",
      errors: null,
      nav
    });
  }
}

const buildAccountManagement = (req, res) => {
  res.render("account/account-management", {
      title: "Account Management",   // The title of the page
      messages: req.flash(),
      nav,         
      loggedin: res.locals.loggedin || 0  // You can set this based on your authentication logic
  });
};


module.exports = { accountLogin, buildAccountManagement,buildLogin, buildRegister, registerAccount };


