const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav(); 
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,  
    grid,
  });
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

    // Generate the navigation HTML
    let nav = await utilities.getNav();

    // Generate the vehicle detail HTML
    const vehicleHTML = utilities.buildVehicleDetailHTML(vehicleData);

    // Render the detail page and pass nav
    res.render('inventory/detail', {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`, 
      vehicleHTML,
      nav, 
    });
  } catch (error) {
    next(error); 
  }
};

module.exports = invCont;
