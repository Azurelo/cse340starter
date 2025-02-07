const utilities = require("../utilities/");

function triggerError(req, res, next) {
    try {
        throw new Error("Intentional 500 error for testing!");
    } catch (error) {
        utilities.getNav().then(nav => {
            res.status(500).render('errors/500', { 
                title: "Internal Server Error", 
                nav,
                error: error.message
            });
        }).catch(next); 
    }
}


module.exports = { triggerError};
