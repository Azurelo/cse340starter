const utilities = require("../utilities");
const accountModel = require("../models/account-model");
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

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
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



module.exports = { buildLogin, buildRegister, registerAccount };


