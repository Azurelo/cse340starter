const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()
/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}
Util.buildClassificationList = async function(selectedId = null) {
  let data = await invModel.getClassifications();
  let classificationList = data.rows;  // Return the array instead of the HTML string
  return classificationList;
};
/* *************************************
 * Build vehicle detail HTML
 ***************************** */
Util.buildVehicleDetailHTML = function(vehicle) {
  // Check if price and mileage are valid numbers before using toLocaleString
  const price = vehicle.inv_price 
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.inv_price) 
  : 'N/A';
  const mileage = vehicle.inv_miles ? vehicle.inv_miles.toLocaleString() : 'N/A';
  const description = vehicle.inv_description || 'No description available';

  return `
    <div class="vehicle-detail">
      <div class="vehicle-detail-wrapper">
      <div class="vehicle-img">
          <h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
          <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
      </div>  
      <div class="vehicle-info">
          <p><strong>Price:</strong> ${price}</p>
          <p><strong>Mileage:</strong> ${mileage} miles</p>
          <p><strong>Description:</strong> ${description}</p>
        </div>
      </div>
    </div>
  `;
};

/* ****************************************
* Middleware to check token validity
**************************************** */
// Middleware to check if user is logged in (JWT token validation)
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    console.log("User is logged in:", res.locals.accountData); // Debugging: check if logged in
    return next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login"); // Redirect if not logged in
  }
};


// Middleware to check account type (Employee or Admin)
Util.checkAccountType = (req, res, next) => {
  console.log("Account Data:", res.locals.accountData); // Debugging: log account data
  
  if (res.locals.accountData && 
      (res.locals.accountData.account_type === "Employee" || res.locals.accountData.account_type === "Admin")) {
    return next(); // Allow access if account type is Employee or Admin
  } else {
    req.flash("error", "You do not have permission to access this page.");
    return res.redirect("/account/login"); // Redirect if account type is not Employee/Admin
  }
};


// Middleware to check if a JWT token is present and valid
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, function (err, accountData) {
      if (err) {
        req.flash("error", "Please log in.");
        res.clearCookie("jwt");
        return res.redirect("/account/login");
      }
      res.locals.accountData = accountData;
      res.locals.loggedin = true; // Set loggedin flag
      console.log("Account Data in JWT:", accountData); // Debugging log
      next();
    });
  } else {
    console.log("No JWT token found, proceeding to next middleware.");
    next(); // Proceed to next middleware if no token exists
  }
};


// Export the Util object with all its methods
module.exports = Util;
