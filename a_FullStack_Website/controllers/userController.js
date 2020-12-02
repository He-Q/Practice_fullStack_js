const User = require('../models/User')
const Post = require('../models/Post')

exports.ifUserExists = function(req,res,next){
    User.findByUsername(req.params.username).then((userDocument)=>{
        req.profileUser = userDocument
        next()
    }).catch(()=>{
        res.render('404')
    })
}

exports.profilePostsScreen = function(req,res){
    Post.findByAuthorId(req.profileUser._id).then((posts)=>{
        res.render('profile',{
            posts:posts,
            profileUsername:req.profileUser.username,
            profileAvatar:req.profileUser.avatar
        })
    }).catch(()=>{
        res.render('404')
    })
        
   
}

exports.mustBeLoggedIn = function(req,res,next){
    if(req.session.user){
        next()
    }
    else{
        req.flash('errors','You must be logged in ')
        req.session.save(function(){
            res.redirect('/')
        })
    }
}

exports.login = function(req,res){
    let user = new User(req.body)
    user.login().then((result)=>{
        req.session.user = {avatar:user.avatar,username:user.data.username,_id:user.data._id}
        req.session.save(function(){
            res.redirect('/')
        })
    }).catch((e)=>{
        req.flash('errors',e)
        req.session.save(function(){
            res.redirect('/')
        })
    })
}

exports.logout = function(req,res){
    req.session.destroy(function(){
        res.redirect('/')
    })
}

exports.register = function(req,res){
    let user = new User(req.body)
    user.register().then(()=>{
        req.session.user = {username:user.data.username,avatar:user.avatar,_id:user.data._id}
        req.session.save(function(){
            res.redirect('/')
        })
    }).catch((regE)=>{
        regE.forEach(function(err){
            req.flash('regE',err)
        })
        req.session.save(function(){
            res.redirect('/')
        })
    })
    
}

exports.home = function(req,res){ 
    if(req.session.user){
    res.render('home-dashboard')
    }
    else{
    res.render('home-guest',{regE:req.flash('regE')})     
    }
    
}