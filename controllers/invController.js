const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const reviewModel = require("../models/review-model")
const invCont = {};

/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const loggedin = req.session.loggedin || false
  const accountData = req.session.accountData || {}
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data.length > 0 ? data[0].classification_name : "Unknown";

    res.render("./inventory/classification", {
      title: `${className} Vehicles`,
      nav,
      grid,
      loggedin,
      accountData,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Get vehicle details
 * ************************** */
invCont.getVehicleDetail = async function (req, res, next) {
  const loggedin = req.session.loggedin || false;
  const inv_id = req.params.inv_id; // Get inv_id from URL params

  try {
    // Get vehicle data
    const vehicleData = await invModel.getVehicleById(inv_id);
    
    if (!vehicleData) {
      return res.status(404).render('errors/404', { title: "Not Found" });
    }

    // Fetch reviews for the vehicle using the review model
    const reviews = await reviewModel.getReviewsByInventoryId(inv_id);
    
    let nav = await utilities.getNav();
    const vehicleHTML = utilities.buildVehicleDetailHTML(vehicleData);
    console.log(res.locals.accountData);
    console.log(res.locals.accountData);
    res.render('inventory/detail', {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      vehicleHTML,
      nav,
      loggedin,
      reviews: reviews,
      accountData: res.locals.accountData,
      inv_id,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Management View for Inventory
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  const loggedin = req.session.loggedin || false
  const accountData = req.session.accountData || {}
  try {
    let nav = await utilities.getNav(); 
    const flashMessage = req.flash("message") || null; 
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav, 
      message: flashMessage, 
      classificationSelect,
      loggedin,
      accountData,
    });
  } catch (error) {
    next(error); 
  }
};

/* ***************************
 * Build Add Classification View
 * ************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  const loggedin = req.session.loggedin || false
  const accountData = req.session.accountData || {}
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      loggedin,
      accountData
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Validate classification input
 * ************************** */
invCont.validateClassification = async (req, res, next) => {
  try {
    const classificationName = req.body.classificationName;
    const regex = /^[A-Za-z0-9]+$/; 

    if (!regex.test(classificationName)) {
      req.flash('error', 'Classification name cannot contain spaces or special characters.');
      return res.redirect('/inv/add-classification'); 
    }

    next(); 
  } catch (error) {
    next(error); 
  }
};

/* ***************************
 * Add new classification - POST route
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const classificationName = req.body.classificationName;
  const loggedin = req.session.loggedin || false

  try {
    // Insert new classification into the database
    const result = await invModel.addClassification(classificationName);
    
    // On success, show success message and render management page
    req.flash('message', 'New classification added successfully!');

    // Dynamically update the navigation
    let nav = await utilities.getNav();
    res.render('./inventory/management', {
      title: "Inventory Management",
      nav,  
      message: req.flash('message'), 
      loggedin,
    });
  } catch (error) {
    req.flash('error', 'Failed to add classification. Please try again.');
    let nav = await utilities.getNav();
    res.render('./inv/add-classification', {
      title: "Add Classification",
      nav,
      error: 'Failed to add classification. Please try again.',
      loggedin, 
    });
  }
};

// Display the Add Inventory view

invCont.buildAddInventoryView = async function(req, res) {
  const loggedin = req.session.loggedin || false
  const accountData = req.session.accountData || {}
  try {
    const classificationList = await utilities.buildClassificationList();
    console.log(classificationList);  
    let nav = await utilities.getNav(); 
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,  
      message: req.flash("message"),
      loggedin,
      accountData,
    });
  } catch (error) {
    console.error("Error rendering add-inventory view:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Validate inventory input
invCont.validateInventory = async function(req, res, next) {
  const { inv_make, inv_model, inv_price, inv_year, inv_miles, inv_color } = req.body;
  
  // Check for missing fields
  if (!inv_make || !inv_model || !inv_price || !inv_year || !inv_miles || !inv_color) {
    req.flash("message", "All fields are required.");
    return res.redirect("/inv/add-inventory");
  }
  
  // Validate price (must be a positive number)
  if (isNaN(inv_price) || inv_price <= 0) {
    req.flash("message", "Price must be a valid positive number.");
    return res.redirect("/inv/add-inventory");
  }
  
  // Validate year (must be a 4-digit number between 1900 and current year)
  const currentYear = new Date().getFullYear();
  if (!/^\d{4}$/.test(inv_year) || inv_year < 1900 || inv_year > currentYear) {
    req.flash("message", "Please enter a valid 4-digit year.");
    return res.redirect("/inv/add-inventory");
  }
  
  // Validate miles (must be a positive number)
  if (isNaN(inv_miles) || inv_miles < 0) {
    req.flash("message", "Miles must be a valid non-negative number.");
    return res.redirect("/inv/add-inventory");
  }
  
  // Validate color 
  const regex = /^[A-Za-z0-9\s]+$/; 
  if (!regex.test(inv_color)) {
    req.flash("message", "Color can only contain letters, numbers, and spaces.");
    return res.redirect("/inv/add-inventory");
  }

  // All validations passed, proceed to next middleware
  next();
};

//Update Validation

invCont.checkUpdateData = async (req, res, next) => {
  let { inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id } = req.body;

  if (!inv_make || !inv_model || !inv_description || !inv_price || !inv_year || !inv_miles || !inv_color || !classification_id) {
      let nav = await utilities.getNav();
      const classificationSelect = await utilities.buildClassificationList(classification_id);

      req.flash("notice", "Please complete all required fields.");
      res.status(400).render("inventory/edit-inventory", {
          title: "Edit " + inv_make + " " + inv_model,
          nav,
          classificationSelect,
          errors: null,
          inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
      });
      return;
  }
  next();
};

// Handle form submission
invCont.addInventory = async function(req, res) {
  try {
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body;

    const result = await invModel.addVehicle({
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    });

    if (result) {
      req.flash("message", "Vehicle added successfully!");
      res.redirect("/inv/");
    } else {
      req.flash("message", "Failed to add vehicle. Try again.");
      res.redirect("/inv/add-inventory");
    }
  } catch (error) {
    console.error("Error adding inventory:", error);
    req.flash("message", "Error processing request.");
    res.redirect("/inv/add-inventory");
  }
};


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

//Build edit inventory view
invCont.editInventoryView = async function (req, res, next) {
  const loggedin = req.session.loggedin || false
  const accountData = req.session.accountData || {}
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getVehicleById(inv_id);

    if (!itemData) {
      req.flash("message", "Vehicle not found.");
      return res.redirect("/inv/");
    }

    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
      loggedin,
      accountData,
    });
  } catch (error) {
    next(error);
  }
};


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;

    const updateResult = await invModel.updateVehicleById({
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });

    if (updateResult) {
      req.flash("success", "Vehicle updated successfully!");
      return res.redirect("/inv/");
    } else {
      req.flash("error", "Update failed. Please try again.");
      return res.redirect(`/inv/edit-inventory/${inv_id}`);
    }
  } catch (error) {
    next(error);
  }
};

module.exports =  invCont ;
