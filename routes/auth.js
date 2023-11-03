const express = require("express");
const User = require("../models/user")
const ExpressError = require("../expressError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const router = new express.Router();


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

//login routes always need jwt.sign to generate a token 
router.post("/login",  async (req, res, next) => {
    try {
        const { username, password } = req.body;
       if (await User.authenticate(username, password)){
            let token = jwt.sign({ username }, SECRET_KEY);
            User.updateLoginTimestamp(username);
            return res.json({ token })
       } else {
           throw new ExpressError('Invalid username/password', 400)
        }
    } catch(e) {
        return next(e);
    }
} )

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */


router.post("/register", async (req, res, next) => {
    try {
        //if you are requesting the qhole req.body ...you dont need to destructure one by one 
        
        const info = req.body;
        const { username } = await User.register(info);
        //you still need to sign but you dont need to authenticate for login just sign 
            let token = jwt.sign({ username }, SECRET_KEY);
            User.updateLoginTimestamp(username);
        return res.json({ token });
        
        //after you rgister...make sure you do jwt.sign to create a key for login 
        //rememebr to do res.json to gdt json back or else you may not be able to read it
    } catch (e) {
        if (e.code === 230505) {
            return next(new ExpressError(`Userername ${username} taken, please choose another`))
        }
        return next(e);
    }
});



module.exports = router;