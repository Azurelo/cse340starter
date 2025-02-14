/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session")
const bodyParser = require("body-parser");
const pool = require('./database/')
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require('./routes/inventoryRoute'); 
const errorRoutes = require("./routes/errorRoutes");
const accountRoute = require("./routes/accountRoutes");
const utilities = require('./utilities');


/* ***********************
 * Middleware
 * ************************/

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))
// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
/* ***********************
 * View Engine Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root



/* ***********************
 * Routes
 *************************/
app.use(static)
// Index route
app.get('/', baseController.buildHome)
// Inventory routes
app.use("/inv", inventoryRoute)
app.use(errorRoutes);
app.use("/account", accountRoute);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('errors/500', { title: "Server Error" });
});

app.use((req, res) => {
  utilities.getNav()  
    .then(nav => {
      res.status(404).render('errors/404', { 
        title: "Page Not Found",
        nav 
      });
    })
    .catch(error => {
      console.error("Error fetching nav:", error);
      res.status(404).render('errors/404', {
        title: "Page Not Found",
        nav: "" 
      });
    });
});
/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`)
})
