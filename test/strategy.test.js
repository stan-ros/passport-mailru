/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require('chai')
  , MailruStrategy = require('../lib/strategy');


describe('Strategy', function() {
  var CLIENT_ID = 'ABC123';
  var CLIENT_SECRET = 'secret';
    
  describe('constructed', function() {
    var strategy = new MailruStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET
      },
      function() {});
    
    it('should be named mailru', function() {
      expect(strategy.name).to.equal('mailru');
    });
  });
  
  describe('constructed with undefined options', function() {
    it('should throw', function() {
      expect(function() {
        var strategy = new MailruStrategy(undefined, function(){});
      }).to.throw(Error);
    });
  });

  describe('authorization request', function() {
    var strategy = new MailruStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET
      }, function() {});
    
    
    var url;

    before(function(done) {
      chai.passport.use(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
        })
        .authenticate();
    });

    it('should be redirected', function() {
      expect(url).to.equal('https://connect.mail.ru/oauth/authorize?response_type=code&client_id='+CLIENT_ID);
    });
  });

  describe('failure caused by user denying request', function() {
    var strategy = new MailruStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET
      }, function() {});
    
    
    var info;
  
    before(function(done) {
      chai.passport.use(strategy)
        .fail(function(i) {
          info = i;
          done();
        })
        .req(function(req) {
          req.query = {};
          req.query.error = 'access_denied';
          req.query.error_code = '200';
          req.query.error_description  = 'Permissions error';
          req.query.error_reason = 'user_denied';
        })
        .authenticate();
    });
  
    it('should fail with info', function() {
      expect(info).to.not.be.undefined;
      expect(info.message).to.equal('Permissions error');
    });
  });
});
