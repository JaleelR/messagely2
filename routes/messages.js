const express = require("express");
const Message = require("../models/message");
const ExpressError = require("../expressError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const router = new express.Router();
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");


/** GET /:id - get detail of message.
 
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await Message.get(id);
        return res.json({
            message: user
        })
    } catch (e) {
        return next(e);
    }
})



/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const { from_username, to_username, body } = req.body;
        const userM = await Message.create({ from_username, to_username, body });
        return res.json({ message: userM })
    } catch (e) {
        return next(e)
    }

});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const correctuser = await Message.get(id);
        console.log(req.user.username)
        if (req.user.username !== correctuser.to_user.username) {
            throw new ExpressError("You cannot read this message")
        }
        const msg = await Message.markRead(id);
        console.log(msg)
        return res.json({
            message: msg
        })
    } catch (e) {
        return next(e);
    }
})
module.exports = router;