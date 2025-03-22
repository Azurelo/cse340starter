const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res) {
  const nav = await utilities.getNav()
  
  // Ensure session variables are available
  const loggedin = req.session.loggedin || false
  const accountData = req.session.accountData || {}

  res.render("index", {
    title: "Home",
    nav,
    loggedin,
    accountData,
  })
}

module.exports = baseController
