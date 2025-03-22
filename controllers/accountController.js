// Import necessary modules
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require('bcryptjs');
const pool = require("../database/");

// Deliver login view
async function buildLogin(req, res, next) {
  let loggedin = req.session.loggedin || false;
  let accountData = req.session.accountData || null;
  try {
    let nav = await utilities.getNav();
    let notice = req.flash("notice");
    res.render("account/login", {
      title: "Login",
      nav,
      notice,
      errors: null,
      loggedin,
      accountData
    });
  } catch (error) {
    next(error);
  }
}

// Deliver registration view
async function buildRegister(req, res, next) {
  let loggedin = req.session.loggedin || false;
  let accountData = req.session.accountData || null;
  try {
    let nav = await utilities.getNav();
    console.log('Nav:', nav);
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      loggedin,
      accountData,
    });
  } catch (error) {
    console.error("Error in buildRegister:", error);
    next(error);
  }
}

// Process registration
async function registerAccount(req, res) {
  let loggedin = req.session.loggedin || false;
  let accountData = req.session.accountData || null;
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
    loggedin = true;
    res.redirect("/account/login");
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      loggedin,
    });
  }
}

// Process login request
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      notice: req.flash('notice'),
      loggedin: false, // Ensure this is false if login fails
    });
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });

      req.session.loggedin = true;
      req.session.accountData = accountData; // Store user info in session
      
      res.cookie("jwt", accessToken, { httpOnly: true, secure: process.env.NODE_ENV !== 'development', maxAge: 3600 * 1000 });
      
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        loggedin: false, // Ensure this is passed correctly
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Internal Server Error");
  }
}



// Account management page
async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    let loggedin = req.session.loggedin || false;
    let accountData = req.session.accountData || null; // Store account data in session
    console.log("Rendering Account Management Page with Data:", accountData);

    res.render("account/account-management", {
      title: "Account Management",
      nav,
      loggedin,
      accountData, // Pass account data
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildAccountManagement:", error);
    next(error);
  }
}



// Update account handler
async function updateAccount(req, res) {
  // Destructure the values from req.body
  const { firstName, lastName, email, account_id } = req.body;
  console.log(req.body)
  // Ensure all required fields are present
  if (!firstName || !lastName || !email) {
      req.flash('error', 'All fields must be filled out!');
      return res.redirect(`/account/update/${account_id}`);
  }

  try {
      // Use the updated function to run the query
      const query = 'UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4';
      await pool.query(query, [firstName, lastName, email, account_id]);

      // Flash success message and redirect
      req.flash('success', 'Account updated successfully!');
      return res.redirect(`/account/update/${account_id}`);
  } catch (error) {
      // Handle errors
      console.error("Error updating account:", error);
      req.flash('error', 'There was an error updating the account.');
      return res.redirect(`/account/update/${account_id}`);
  }
}


// Change password handler
async function changePassword(req, res) {
  const { password, account_id } = req.body;
  let nav = await utilities.getNav();
  // Check if the password meets the minimum length requirement
  if (password.length < 8) {
    return res.render("account/update", { 
      error: "Password must be at least 8 characters." 
    });
  }

  try {
    // Hash the new password and update it in the database
    const hashedPassword = await bcrypt.hash(password, 10);
    await accountModel.updatePassword(account_id, hashedPassword);
    // Success message via flash
    req.flash("success", "Password changed successfully!");

    // Redirect to the update page with the success message
    return res.redirect(`/account/update/${account_id}`);
  } catch (error) {
    console.error("Change Password Error:", error.message);

    // Render with error and success message as fallback
    return res.render("account/update", { 
      error: "An error occurred while changing the password.", 
      success: req.flash("success"), // Get the flash message if any
      accountData: { account_id },
      nav,
    });
  }
}



// Log out handler
async function logout(req, res) {
  req.session.destroy((err) => {
      if (err) {
          console.error("Logout Error:", err);
          return res.status(500).send("Error logging out.");
      }
      res.clearCookie("jwt");
      res.redirect("/");
  });
}

// Render update account page
async function buildUpdateAccountPage(req, res) {
  let nav = await utilities.getNav();
  const { id } = req.params;
  const accountData = await accountModel.getAccountById(id); 
  console.log("Update Account Route Hit:", req.params.id);
  console.log("Fetched Account Data:", accountData);
  console.log("Requested ID:", id);
  let loggedin = req.session.loggedin || false;
  if (!accountData) {
    return res.status(404).send("Account not found");
  }
  let successMessage = req.flash("success"); 
  
  res.render("account/update", {
    title: "Update Account",
    nav,
    accountData,
    error: null,
    success: successMessage.length ? successMessage[0] : null,
    loggedin,
  });
}

module.exports = { buildUpdateAccountPage, logout, changePassword, updateAccount, accountLogin, buildAccountManagement, buildLogin, buildRegister, registerAccount };
