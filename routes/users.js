const express = require("express");
const User = require("../models/user")
const ExpressError = require("../expressError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const router = new express.Router();
const { ensureLoggedIn } = require("../middleware/auth");


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        
        const users = await User.all();
        res.json({ users: users })
    } catch (e) {
        return next(e);
    }
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", ensureLoggedIn ,async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.get(username);
        res.json({user: user})
} catch (e) {
        return next(e);
}
})
/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureLoggedIn, async (req, res, next) => {
    try {
        const { username } = req.params;
        const userInfo = await User.messagesTo(username);
        const { id, body, sent_at, read_at, from_user } = userInfo;
        return res.json({
            messages: id, body, sent_at, read_at, from_user
      })  
    } catch (e) {
        return next(e)
    }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureLoggedIn, async (req, res, next) => {
    try {
        const { username } = req.params;
        const userInfo = await User.messagesFrom(username);
        const { id, body, sent_at, read_at, to_user } = userInfo;
        return res.json({
            messages:
            id,
            body,
            sent_at,
            read_at,
            to_user
        })
    } catch (e) {
        return next(e)
    }
})

module.exports = router;