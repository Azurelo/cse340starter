/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const session = require("express-session");
const bodyParser = require("body-parser");
const pool = require("./database/");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const flash = require("connect-flash");
const PgSession = require("connect-pg-simple")(session);
const cookieParser = require("cookie-parser")
const app = express();
const staticRoutes = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const errorRoutes = require("./routes/errorRoutes");
const accountRoute = require("./routes/accountRoutes");
const utilities = require("./utilities");
const reviewRoutes = require("./routes/reviewRoutes")
/* ***********************
 * Middleware
 *************************/

// Session middleware
app.use(
  session({
    store: new PgSession({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false, // Changed to false for efficiency
    saveUninitialized: false, // Changed to false for security
    name: "sessionId",
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Flash messages middleware
app.use(flash());

// Middleware to make flash messages available in views
app.use((req, res, next) => {
  res.locals.notice = req.flash("notice"); // Flash message for success notifications
  res.locals.error = req.flash("error"); // Flash message for error notifications
  next();
});
app.use((req, res, next) => {
  res.locals.loggedin = req.session && req.session.user ? true : false;
  res.locals.accountData = req.session.user || {};
  next();
});
// Express Messages Middleware
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
/* ***********************
 * View Engine Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Not at views root
app.use(utilities.checkJWTToken)
/* ***********************
 * Routes
 *************************/
app.use(staticRoutes);

// Index route
app.get("/", baseController.buildHome);

// Inventory routes
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);
app.use("/reviews", reviewRoutes);
app.use(errorRoutes);

/* ***********************
 * Error Handling
 *************************/

// 500 - Server Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errors/500", { title: "Server Error" });
});

// 404 - Page Not Found
app.use((req, res) => {
  utilities
    .getNav()
    .then((nav) => {
      res.status(404).render("errors/404", {
        title: "Page Not Found",
        nav,
      });
    })
    .catch((error) => {
      console.error("Error fetching nav:", error);
      res.status(404).render("errors/404", {
        title: "Page Not Found",
        nav: "",
      });
    });
});

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

/* ***********************
 * Start Server
 *************************/
app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
