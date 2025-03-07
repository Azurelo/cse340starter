const express = require("express");
const router = new express.Router();
const invCont = require("../controllers/invController");
const utilities = require('../utilities/account-validation')
// Route to build inventory by classification view
router.get("/type/:classificationId", invCont.buildByClassificationId); 

// Route to get vehicle details
router.get("/detail/:inv_id", invCont.getVehicleDetail); 

// Route to access the inventory management view
router.get("/", invCont.buildManagementView);

// Route to display the Add Classification view
router.get('/add-classification', invCont.buildAddClassificationView);

// Route to handle the Add Classification form submission
router.post('/add-classification', invCont.validateClassification, invCont.addClassification);

router.get("/add-inventory", invCont.buildAddInventoryView);
router.get("/getInventory/:classification_id", utilities.handleErrors(invCont.getInventoryJSON))
router.post("/add-inventory", invCont.validateInventory, invCont.addInventory);
module.exports = router;
