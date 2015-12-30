require('dotenv').load()
var http = require('http')
var url = require('url')
var OAuth = require('oauth').OAuth
var open = require('open')

var trelloKey = process.env.TRELLO_KEY
var trelloSecret = process.env.TRELLO_SECRET
var requestUrl = "https://trello.com/1/OAuthGetRequestToken"
var accessUrl = "https://trello.com/1/OAuthGetAccessToken"
var authorizeUrl = "https://trello.com/1/OAuthAuthorizeToken"
var domain = "127.0.0.1"
var port = 1515
var baseUrl = 'http://' + domain + ':' + port + '/login'
var callbackUrl = 'http://' + domain + ':' + port + '/callback'
var appName = "Weekello"
var oauthSecrets = {}

var oa = new OAuth(
  requestUrl,
  accessUrl,
  trelloKey,
  trelloSecret,
  '1.0',
  callbackUrl,
  'HMAC-SHA1'
);

function login(req, res) {
  oa.getOAuthRequestToken(function (error, token, tokenSecret, results) {
    oauthSecrets[token] = tokenSecret
    res.writeHead(302, {
      'Location': authorizeUrl + '?oauth_token=' + token + '&name=' + appName
    })
    res.end()
  })
}

function callback(req, res) {
  var query = url.parse(req.url, true).query
  var token = query.oauth_token
  var tokenSecret = oauthSecrets[token]
  var verifier = query.oauth_verifier

  oa.getOAuthAccessToken(token, tokenSecret, verifier, function (error, accessToken, accessTokenSecret, results) {
    oa.getProtectedResource("https://api.trello.com/1/members/me", "GET", accessToken, accessTokenSecret, function (error, data, response) {
      serveClosingPage(res)
    })
  })
}

function serveClosingPage(res) {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  })
  res.write('<pre>You may close this tab now :)</pre>')
  res.end()
}


http.createServer(function (req, res) {
  if (/^\/login/.test(req.url)) {
    login(req, res)
  } else if (/^\/callback/.test(req.url)) {
    callback(req, res)
  } else {
    res.end("Don't know about that")
  }
}).listen(port, domain);

open(baseUrl)
