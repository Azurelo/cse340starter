// Import necessary modules
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require('bcryptjs');

// Deliver login view
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    let notice = req.flash("notice");
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

// Deliver registration view
async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav();
    console.log('Nav:', nav);
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

// Process registration
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before saving it
  const hashedPassword = await bcrypt.hash(account_password, 10);
  console.log("Hashed Password:", hashedPassword);

  // Pass the hashed password to the model for registration
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
    res.redirect("/account/login");
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

// Process login request
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  console.log("Account Data:", accountData);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      
      // Set session.loggedin to true after successful login
      req.session.loggedin = true;

      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
      }
      return res.redirect("/account/");
    } else {
      req.flash("message notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error('Access Forbidden');
  }
}


// Account management page
async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    let loggedin = req.session.loggedin || false;  // Add loggedin status

    res.render("account/account-management", {
      title: "Account Management",
      nav,
      loggedin,  // Pass loggedin variable here
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildAccountManagement:", error);
    next(error);
  }
}


// Update account handler
async function updateAccount(req, res) {
  const { firstName, lastName, email, account_id } = req.body;

  // Check if email already exists
  const existingAccount = await accountModel.getAccountByEmail(email);
  if (existingAccount && existingAccount.account_id !== account_id) {
    return res.render("account/update", { error: "Email already in use" });
  }

  // Update account in database
  await accountModel.updateAccount(account_id, firstName, lastName, email);

  // Success message
  req.flash("success", "Account updated successfully!");
  res.redirect(`/account/management/${account_id}`);
}

// Change password handler
async function changePassword(req, res) {
  const { password, account_id } = req.body;

  if (password.length < 8) {
    return res.render("account/update", { error: "Password must be at least 8 characters." });
  }

  // Hash the new password and update it in the database
  const hashedPassword = await bcrypt.hash(password, 10);
  await accountModel.updatePassword(account_id, hashedPassword);

  // Success message
  req.flash("success", "Password changed successfully!");
  res.redirect(`/account/management/${account_id}`);
}

// Log out handler
async function logout(req, res) {
  res.clearCookie('jwt');
  res.redirect('/');
}

// Render update account page
async function buildUpdateAccountPage(req, res) {
  const { id } = req.params;
  const accountData = await accountModel.getAccountById(id); // Use correct model method

  if (!accountData) {
    return res.status(404).send("Account not found");
  }

  const loggedin = req.session.loggedin || false;
  res.render("account/update-account", {
    title: "Update Account",
    accountData,
    error: null,
    success: null,
    loggedin,
  });
}

module.exports = { buildUpdateAccountPage, logout, changePassword, updateAccount, accountLogin, buildAccountManagement, buildLogin, buildRegister, registerAccount };
