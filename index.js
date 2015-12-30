require('dotenv').load()
var http = require('http')
var url = require('url')
var OAuth = require('oauth').OAuth
var open = require('open')
var Promise = require("bluebird")
var moment = require('moment')

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
      'Location': authorizeUrl + '?oauth_token=' + token + '&name=' + appName + '&scope=read,write'
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
/*
    oa.getProtectedResource("https://api.trello.com/1/members/me", "GET", accessToken, accessTokenSecret, function (error, data, response) {
      serveClosingPage(res)
    })
*/

    oa.post("https://api.trello.com/1/boards", accessToken, accessTokenSecret, {
      name: 'Weekello Test'
    }, null, function (error, boardStr, response) {
      var board = JSON.parse(boardStr)
      var boardId = board.id
      console.log('boardId:', boardId, typeof boardId)


      createLists(boardId, dateToWeekNames('2016'), accessToken, accessTokenSecret)
/*
      dateToWeekNames('2016').forEach(function (name) {
        oa.post("https://api.trello.com/1/lists", accessToken, accessTokenSecret, {
          name: name,
          idBoard: boardId,
          pos: 'bottom',
        }, null, function (error, list, response) {
          console.log('list:', list)
        })
      })
*/

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

function dateToWeekNames(date) {
  var result = []
  var start = new Date(date.toString())
  var nextYear = start.getFullYear() + 1

  // Start on a Monday
  while (start.getDay() !== 1) {
    start.setDate(start.getDate() - 1)
  }

  var a
  while (start.getFullYear() < nextYear) {
    a = new Date(start.toDateString())
    start.setDate(a.getDate() + 6)
    result.push(
      'Week ' + moment(a).week() + ' / ' +
      moment(a.toISOString()).format('MMM. Do') + '-' +
      moment(start.toISOString()).format('MMM. Do')
    )
    start.setDate(start.getDate() + 1)
  }

  return result.filter(function (value, index) {
    return index < 10
  })
}

function createLists(boardId, names, accessToken, accessTokenSecret) {
  return Promise.mapSeries(names, function (name) {
    return createList(boardId, name, accessToken, accessTokenSecret)
  })
}

function createList(boardId, name, accessToken, accessTokenSecret) {
  return new Promise(function (resolve, reject) {
    oa.post('https://api.trello.com/1/lists', accessToken, accessTokenSecret, {
      name: name,
      idBoard: boardId,
      pos: 'bottom',
    }, null, function (error, list, response) {
      if (error) {
        console.log('error:', error)
        reject(error)
        return
      }

      console.log('list:', list)
      resolve()
    })
  })
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
