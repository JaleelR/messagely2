/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  try {
    //send a _token to body 
    //get _token from body and assign _token to tokenfrombody 
    const tokenFromBody = req.body._token;
    //get payload from token, payload includes user info or db info 
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    //create a current user with the payload from jwt.verify 
    req.user = payload; // create a current user
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware: Requires user is authenticated. */
//if user is not authenticated send error...if not return next 
function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

/** Middleware: Requires correct username. */
//will see if payload username is equal to params username to make sure the 
//correct user is being used 
//if so, continue with code
function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
      //if not return error message
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}
// end



module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser
};
