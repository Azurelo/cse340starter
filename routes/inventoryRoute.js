const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.invCont.buildByClassificationId); 

// Route to get vehicle details
router.get("/detail/:inv_id", invController.invCont.getVehicleDetail); 

// Route to access the inventory management view
router.get("/", invController.invCont.buildManagementView);

// Route to display the Add Classification view
router.get('/add-classification', invController.invCont.buildAddClassificationView);

// Route to handle the Add Classification form submission
router.post('/add-classification', invController.invCont.validateClassification, invController.invCont.addClassification); // Added validation middleware

module.exports = router;
