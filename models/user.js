/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");

const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const ExpressError = require("../expressError");
/** User of the site. */

class User {
  constructior({ username, password, first_name, last_name, phone, join_at, last_login_at })
{
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
    this.join_at = join_at;
    this.last_login_at = last_login_at;
  }

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
     const hashpwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR );
    const resp = await db.query(
      `INSERT INTO users ( username, password, first_name, last_name, phone, join_at)
       VALUES ($1, $2, $3, $4, $5, current_timestamp)
       RETURNING username, password, first_name, last_name, phone`,
      [username, hashpwd, first_name, last_name, phone]);
    return resp.rows[0];
   }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;