const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the DB
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }
  

  validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body;
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        });
        return;
    }
    next();
};

// Validation rules for login
validate.loginRules = () => {
    return [
        body("account_email").isEmail().withMessage("Enter a valid email address"),
        body("account_password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
    ];
};

validate.handleErrors = (controllerFunction) => {
  return async (req, res, next) => {
      try {
          await controllerFunction(req, res, next);
      } catch (error) {
          console.error("Error in controller function:", error);
          res.status(500).render("error", { message: "Something went wrong!" });
      }
  };
};
module.exports = validate