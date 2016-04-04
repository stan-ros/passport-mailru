/**
 * `MailruAuthorizationError` error.
 *
 * @constructor
 * @param {string} [message]
 * @param {number} [code]
 * @access public
 */
function MailruAuthorizationError(message, code) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'MailruAuthorizationError';
  this.message = message;
  this.code = code;
  this.status = 500;
}

// Inherit from `Error`.
MailruAuthorizationError.prototype.__proto__ = Error.prototype;


// Expose constructor.
module.exports = MailruAuthorizationError;
