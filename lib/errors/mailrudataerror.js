/**
 * `MailruDataAPIError` error.
 *
 *
 * @constructor
 * @param {string} [message]
 * @param {string} [type]
 * @param {number} [code]
 * @param {number} [subcode]
 * @param {string} [traceID]
 * @access public
 */
function MailruDataError(message, type, code, subcode, traceID) {
    Error.call(this);
    Error.captureStackTrace(this, arguments.callee);
    this.name = 'MailruAPIError';
    this.message = message;
    this.type = type;
    this.code = code;
    this.subcode = subcode;
    this.traceID = traceID;
    this.status = 500;
}

// Inherit from `Error`.
MailruDataError.prototype.__proto__ = Error.prototype;


// Expose constructor.
module.exports = MailruDataError;