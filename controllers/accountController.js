const utilities = require("../utilities");
const accountModel = require("../models/account-model");
/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
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
  try {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.redirect("/account/login"); // Use redirect instead of render
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(400).render("account/register", {
        title: "Register",
        nav,
        messages: req.flash(), // Ensure flash messages are available
      });
    }
  } catch (error) {
    console.error("Error in registerAccount:", error);
    req.flash("notice", "An unexpected error occurred. Please try again.");
    res.status(500).redirect("/account/register");
  }
}



module.exports = { buildLogin, buildRegister, registerAccount };


