// Load modules.
var OAuth2Strategy = require('passport-oauth2')
    , util = require('util')
    , uri = require('url')
    , crypto = require('crypto')
    , Profile = require('./profile')
    , InternalOAuthError = require('passport-oauth2').InternalOAuthError
    , MailruAuthorizationError = require('./errors/mailruauthorizationerror')
    , MailruTokenError = require('./errors/mailrutokenerror')
    , MailruDataError = require('./errors/mailrudataerror');


/**
 * `Strategy` constructor.
 *
 * Mailru using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occurred, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Mailru application's App ID
 *   - `clientSecret`  your Mailru application's App Secret
 *   - `callbackURL`   URL to which Mailru will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new MailruStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/mail/callback'
 *       },
 *       function(accessToken, refreshToken, profile, cb) {
 *         User.findOrCreate(..., function (err, user) {
 *           cb(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */
function Strategy(options, verify) {
    options = options || {};
    options.authorizationURL = options.authorizationURL || 'https://connect.mail.ru/oauth/authorize';
    options.tokenURL = options.tokenURL || 'https://connect.mail.ru/oauth/token';
    options.scopeSeparator = options.scopeSeparator || ',';

    OAuth2Strategy.call(this, options, verify);
    this.name = 'mailru';
    this._profileURL = options.profileURL || 'http://www.appsmail.ru/platform/api?method=users.getInfo';
    this._profileFields = options.profileFields || null;
    this._clientSecret = options.clientSecret;
    this._clientID = options.clientID;
}

// Inherit from `OAuth2Strategy`.
util.inherits(Strategy, OAuth2Strategy);

/**
 * Return extra Mailru-specific parameters to be included in the authorization
 * request.
 *
 * Options:
 *  - `display`  Display mode to render dialog, { `page`, `popup`, `touch` }.
 *
 * @param {object} options
 * @return {object}
 * @access protected
 */
Strategy.prototype.authorizationParams = function (options) {
    var params = {};

    if (options.display) {
        params.display = options.display;
    }

    return params;
};

/**
 * Retrieve user profile from Mailru.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 * @param {string} accessToken
 * @param {function} done
 * @access protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
    var url = this._profileURL;
    url += '&app_id=' + this._clientID + '&session_key=' + accessToken + '&secure=1';
    var params = 'app_id=' + this._clientID + 'method=users.getInfosecure=1session_key=' + accessToken;
    var md5sum = crypto.createHash('md5');
    var sigFrom = params + this._clientSecret;
    var sig = md5sum.update(sigFrom).digest("hex");
    url += '&sig=' + sig;
    this._oauth2.get(url, accessToken, function (err, body, res) {
        var json;

        if (err) {
            if (err.data) {
                try {
                    json = JSON.parse(err.data);
                } catch (_) {
                }
            }

            if (json && json.error && typeof json.error == 'object') {
                return done(new MailruDataError(json.error.message, json.error.type, json.error.code, json.error.error_subcode, json.error.fbtrace_id));
            }
            return done(new InternalOAuthError('Failed to fetch user profile', err));
        }

        try {
            json = JSON.parse(body);
            json = json[0];
        } catch (ex) {
            return done(new Error('Failed to parse user profile'));
        }

        var profile = Profile.parse(json);
        profile.provider = 'mailru';
        profile.displayName = json['first_name'] + ' ' + json['last_name'];
        profile.id = json['uid'];
        profile._raw = body;
        profile._json = json;

        done(null, profile);
    });
};

/**
 * Parse error response from Mailru OAuth 2.0 token endpoint.
 *
 * @param {string} body
 * @param {number} status
 * @return {Error}
 * @access protected
 */
Strategy.prototype.parseErrorResponse = function (body, status) {
    var json = JSON.parse(body);
    if (json.error && typeof json.error == 'object') {
        return new MailruTokenError(json.error.message, json.error.type, json.error.code, json.error.error_subcode, json.error.fbtrace_id);
    }
    return OAuth2Strategy.prototype.parseErrorResponse.call(this, body, status);
};

// Expose constructor.
module.exports = Strategy;
