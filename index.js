const express = require('express')
const app = express()

const ignore = require('./ignore.js')
const consumerKey= ignore.twitter.consumer_key
const consumerSecret = ignore.twitter.consumer_secret

const fs = require('fs')

var session = require('express-session')
var passport = require('passport')
var TwitterStrategy = require('passport-twitter').Strategy

// ユーザ情報をセッションに保存するので初期化
app.use(session({
  secret: 'secret-key',
  resave: true,
  saveUninitialized: true
}))
// passport自体の初期化
app.use(passport.initialize())
app.use(passport.session())

// passport-twitterの設定
passport.use(new TwitterStrategy({
  consumerKey: consumerKey,
  consumerSecret: consumerSecret,
  callbackURL: '/auth/twitter/callback'
},
  // 認証後の処理
  function (token, tokenSecret, profile, done) {
    //console.log(`${token} ${tokenSecret}`)
    //console.log(JSON.stringify(profile))
    profile.key = {"token":token,"tokenSecret":tokenSecret}
    return done(null, profile)
  }
))

// セッションに保存
passport.serializeUser(function (user, done) {
  done(null, user)
})
// セッションから復元 routerのreq.userから利用可能
passport.deserializeUser(function (user, done) {
  done(null, user)
})


// 各種ルーティング
app.use((req, res, next)=>{
  console.log('URL = '+req.url)
  next()
})
app.get('/', (req, res) => {
  console.log(req.user)
  res.send('<a href=/auth/twitter>twitter</a>')
})
app.get('/user', (req, res) => {
  res.send(req.user)
})
app.get('/success', (req, res) => {
  res.send(`token : ${req.user.key.token} <br> tokenSeacret : ${req.user.key.tokenSecret}`)
})
app.get('/auth/twitter', passport.authenticate('twitter'))
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/?auth_failed' }),
  function (req, res) {
    res.redirect('/success')
  }
)
app.get('/logout', function(req, res){
  req.logout()
  res.redirect('/')
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
