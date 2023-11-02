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


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */


router.post("/", async (req, res, next) => {
    try {
        const { username, password, first_name, last_name, phone } = req.body;
        
        const newUser = await User.register(username, password, first_name, last_name, phone );
        //after you rgister...make sure you do jwt.sign to create a key for login 
        let token = jwt.sign({ username }, SECRET_KEY);
        //rememebr to do res.json to gdt json back or else you may not be able to read it
        return res.json({ iat: token, username});
    } catch (e) {
        if (e.code === 230505) {
            return next(new ExpressError(`Userername ${username} taken, please choose another`))
        }
        return next(e);
    }
});



module.exports = router;