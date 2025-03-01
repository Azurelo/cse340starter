const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
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
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Get vehicle details
 * ************************** */
invCont.getVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicleData = await invModel.getVehicleById(inv_id);

    if (!vehicleData) {
      return res.status(404).render('errors/404', { title: "Not Found" });
    }

    let nav = await utilities.getNav();
    const vehicleHTML = utilities.buildVehicleDetailHTML(vehicleData);

    res.render('inventory/detail', {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      vehicleHTML,
      nav,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Management View for Inventory
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav(); 
    const flashMessage = req.flash("message") || null; 

    res.render("./inventory/management", {
      title: "Inventory Management",
      nav, 
      message: flashMessage, 
    });
  } catch (error) {
    next(error); 
  }
};

/* ***************************
 * Build Add Classification View
 * ************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
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
      return res.redirect('/inventory/add-classification'); 
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
    });
  } catch (error) {
    req.flash('error', 'Failed to add classification. Please try again.');
    let nav = await utilities.getNav();
    res.render('./inventory/add-classification', {
      title: "Add Classification",
      nav,
      error: 'Failed to add classification. Please try again.'  
    });
  }
};

// Display the Add Inventory view

invCont.buildAddInventoryView = async function(req, res) {
  try {
    const classificationList = await utilities.buildClassificationList();
    let nav = await utilities.getNav(); // Ensure this line is here to define 'nav'
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav, // Now 'nav' is defined
      classificationList,
      message: req.flash("message"),
    });
  } catch (error) {
    console.error("Error rendering add-inventory view:", error);
    res.status(500).send("Internal Server Error");
  }
};


// Validate inventory input
invCont.validateInventory = async function(req, res) {
  const { inv_make, inv_model, inv_price, inv_year, inv_miles, inv_color } = req.body;
  if (!inv_make || !inv_model || !inv_price || !inv_year || !inv_miles || !inv_color) {
    req.flash("message", "All fields are required.");
    return res.redirect("/inventory/add-inventory");
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
      res.redirect("/inventory/");
    } else {
      req.flash("message", "Failed to add vehicle. Try again.");
      res.redirect("/inventory/add-inventory");
    }
  } catch (error) {
    console.error("Error adding inventory:", error);
    req.flash("message", "Error processing request.");
    res.redirect("/inventory/add-inventory");
  }
};

module.exports =  invCont ;
