const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
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
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
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

async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    console.log('Nav fetched:', nav); 

    if (!nav) {
      throw new Error("Navigation data is empty or undefined");
    }

    // Pass nav explicitly to the template
    res.render("account/account-management", {
      title: "Account Management",
      nav, 
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildAccountManagement:", error);
    next(error);
  }
}

// Account update handler
async function updateAccount(req, res) {
  const { firstName, lastName, email, account_id } = req.body;
  
  // Validation (check if email already exists, etc.)
  const existingAccount = await accountModel.getAccountByEmail(email);
  if (existingAccount && existingAccount.account_id !== account_id) {
    return res.render("account/update", { error: "Email already in use" });
  }

  // Update account
  await accountModel.updateAccount(account_id, firstName, lastName, email);
  
  // Success message
  req.flash("success", "Account updated successfully!");
  res.redirect(`/account/management/${account_id}`);
};

// Password change handler
async function changePassword(req, res) {
  const { password, account_id } = req.body;

  // Validate password
  if (password.length < 8) {
    return res.render("account/update", { error: "Password must be at least 8 characters." });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  await accountModel.updatePassword(account_id, hashedPassword);
  
  // Success message
  req.flash("success", "Password changed successfully!");
  res.redirect(`/account/management/${account_id}`);
};

async function logout(req, res) {
  res.clearCookie('jwt');
  res.redirect('/');
};

async function buildUpdateAccountPage(req, res) {
  try {
      const accountId = req.params.id;  // Get accountId from URL params
      const accountData = await getAccountById(accountId); 

      if (!accountData) {
          return res.status(404).send("Account not found");
      }

      res.render("account/update-account", {
          title: "Update Account",
          accountData: accountData,
          error: null,
          success: null,
      });
  } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving account");
  }
}


module.exports = { buildUpdateAccountPage, logout, changePassword, updateAccount, accountLogin, buildAccountManagement, buildLogin, buildRegister, registerAccount };
