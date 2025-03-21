const express = require("express");
const router = new express.Router();
const invCont = require("../controllers/invController");
const utilities = require('../utilities/account-validation');
const Util = require('../utilities/index')
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invCont.buildByClassificationId)); 

// Route to get vehicle details
router.get("/detail/:inv_id", utilities.handleErrors(invCont.getVehicleDetail)); 

// Route to access the inventory management view
router.get("/", utilities.handleErrors(invCont.buildManagementView));

// Route to display the Add Classification view
router.get('/add-classification', utilities.handleErrors(invCont.buildAddClassificationView));

// Route to handle the Add Classification form submission
router.post('/add-classification', invCont.validateClassification, utilities.handleErrors(invCont.addClassification));

//Route to display edit inventory view
router.get('/edit/:inv_id', utilities.handleErrors(invCont.editInventoryView));

router.get("/add-inventory", Util.checkLogin, Util.checkAccountType, utilities.handleErrors(invCont.buildAddInventoryView));
router.get("/getInventory/:classification_id", utilities.handleErrors(invCont.getInventoryJSON))
router.post("/add-inventory", invCont.validateInventory, utilities.handleErrors(invCont.addInventory));
router.post("/update/", utilities.handleErrors(invCont.checkUpdateData, invCont.updateInventory))
module.exports = router;
