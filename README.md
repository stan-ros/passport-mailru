# passport-mail

[Passport](http://passportjs.org/) strategy for authenticating with [Mailru](http://mail.ru/)
using the OAuth 2.0 API.

## Install

    $ npm install passport-mail

## Usage

```js
passport.use(new MailruStrategy({
    clientID: MAIL_APP_ID,
    clientSecret: MAIL_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/mail/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ mailId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
```

