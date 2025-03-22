const utilities = require("../utilities/");

function triggerError(req, res, next) {
    const loggedin = req.session.loggedin || false
    const accountData = req.session.accountData || {}
    try {
        throw new Error("Intentional 500 error for testing!");
    } catch (error) {
        utilities.getNav().then(nav => {
            res.status(500).render('errors/500', { 
                title: "Internal Server Error", 
                nav,
                error: error.message,
                loggedin,
                accountData,
            });
        }).catch(next); 
    }
}


module.exports = { triggerError};
