const express = require('express')
const router = require('./router')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const app = express()

let sessionOption = session({
    secret:"HOLYMOLLY",
    store: new MongoStore({client:require('./db')}),
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:1000 * 60 * 60 * 24,httpOnly:true}

})

app.use(sessionOption)
app.use(flash())

app.use(function(req,res,next){
    res.locals.user = req.session.user
    next()
})

app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))
app.set('views','views')
app.set('view engine','ejs')



app.use('/',router)

module.exports = app