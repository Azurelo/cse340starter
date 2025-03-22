const express = require("express");
const router = new express.Router();
const invCont = require("../controllers/invController");
const utilities = require('../utilities/account-validation');
const Util = require('../utilities/index');

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invCont.buildByClassificationId)); 

// Route to get vehicle details
router.get("/detail/:inv_id", utilities.handleErrors(invCont.getVehicleDetail)); 

// Route to access the inventory management view (restricted to logged-in employees or admins)
router.get("/", Util.checkLogin, Util.checkAccountType, utilities.handleErrors(invCont.buildManagementView));

// Route to display the Add Classification view (restricted)
router.get('/add-classification', Util.checkLogin, Util.checkAccountType, utilities.handleErrors(invCont.buildAddClassificationView));

// Route to handle the Add Classification form submission (restricted)
router.post('/add-classification', Util.checkLogin, Util.checkAccountType, invCont.validateClassification, utilities.handleErrors(invCont.addClassification));

// Route to display edit inventory view (restricted)
router.get('/edit/:inv_id', Util.checkLogin, Util.checkAccountType, utilities.handleErrors(invCont.editInventoryView));

// Route to add inventory (restricted)
router.get("/add-inventory", Util.checkLogin, Util.checkAccountType, utilities.handleErrors(invCont.buildAddInventoryView));

// Route to get inventory JSON (public access)
router.get("/getInventory/:classification_id", utilities.handleErrors(invCont.getInventoryJSON));

// Route to handle adding inventory (restricted)
router.post("/add-inventory", Util.checkLogin, Util.checkAccountType, invCont.validateInventory, utilities.handleErrors(invCont.addInventory));

// Route to update inventory (restricted)
router.post("/update/", Util.checkLogin, Util.checkAccountType, utilities.handleErrors(invCont.checkUpdateData, invCont.updateInventory));

module.exports = router;
