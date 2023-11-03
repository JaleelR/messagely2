/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");

const { BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../expressError");
/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */



  //You must add the column while creating before updatating it
  static async register({ username, password, first_name, last_name, phone }) {

    const hashpwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const resp = await db.query(
      `INSERT INTO users ( username, password, first_name, last_name, phone, join_at, last_login_at)
       VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
       RETURNING username, password, first_name, last_name, phone`,
      [username, hashpwd, first_name, last_name, phone]);

    return resp.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    const resp = await db.query(`SELECT password FROM users WHERE username = $1`
      , [username]);
    const user = resp.rows[0];
    if (!user) {
      const err = new Error(`Username ${username} Not found `);
      err.status = 400;
      throw err;
    } else {
      return await bcrypt.compare(password, user.password)
    }
    //compare password typed in with hash password

  }

  //you dont have to return anything when updating 
  /** Update last_login_at for user */
  static async updateLoginTimestamp(username) {
    const resp = await db.query(
      `UPDATE users
    SET last_login_at = current_timestamp 
    WHERE username = $1 RETURNING username`, [username]);
    if (!resp.rows[0]) {
      const err = new Error(`Username ${username} Not found `);
      err.status = 404;
      throw err;
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const resp = await db.query(`SELECT 
    username, first_name, last_name,
    phone
    FROM users`);
    return resp.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {

    const resp = await db.query(`SELECT 
    username, first_name, last_name,
    phone, join_at, last_login_at 
    FROM users
   WHERE username = $1`,
      [username]);
    const user = resp.rows[0];
    if (!user) {
      const err = new Error(`Username ${username} Not found `);
      err.status = 400;
      throw err;
    }
    return user;
  }


  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    //get user
    //return messages from_user
    //where to_user is
    ///returns what user sent them messages
    const resp = await db.query(`
     SELECT 
    m.id, 
    m.to_username, 
    u.first_name, 
    u.last_name, 
    u.phone,
    m.body,
    m.sent_at, 
    m.read_at
   FROM messages AS m
   JOIN users AS u ON m.to_username = u.username 
    WHERE m.from_username = $1`, [username]);

    return resp.rows.map(m => ({
      id: m.id,
      //connect to_username to users table
      to_user: {
        username: m.to_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const resp = await db.query(`
    SELECT
     m.id,
     m.from_username,
    u.first_name,
    u.last_name,
    u.phone,
     m.body,
     m.sent_at,
     m.read_at
     FROM messages AS m 
     JOIN users AS u ON m.from_username = u.username  
    WHERE m.to_username = $1`, [username]);

    return resp.rows.map(m => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }))
  }
}


module.exports = User;