const User = require('../models/User')
const Post = require('../models/Post')
const Follow = require('../models/Follow')

exports.sharedProfileData = async function(req,res,next){
    let isVisitorsProfile = false
    let isFollowing = false
    if(req.session.user){
        isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
        isFollowing = await Follow.isVisitorFollowing(req.profileUser._id,req.visitorId)
    }
    req.isVisitorsProfile = isVisitorsProfile
    req.isFollowing = isFollowing

    let postCountPromise = Post.countPostsByAuthor(req.profileUser._id)
    let followersCountPromise = Follow.countFollowersById(req.profileUser._id)
    let followingCountPromise = Follow.countFollowingById(req.profileUser._id)
    let [postCount,followersCount,followingCount] = await Promise.all([postCountPromise,followersCountPromise,followingCountPromise])

    req.postCount = postCount
    req.followersCount = followersCount
    req.followingCount = followingCount

    next()
}

exports.ifUserExists = function(req,res,next){
    User.findByUsername(req.params.username).then((userDocument)=>{
        req.profileUser = userDocument
        next()
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

exports.home = async function(req,res){ 
    if(req.session.user){
    let posts = await Post.getFeed(req.session.user._id)
    res.render('home-dashboard',{posts:posts})
    }
    else{
    res.render('home-guest',{regE:req.flash('regE')})     
    }
    
}

exports.profilePostsScreen = function(req,res){
    Post.findByAuthorId(req.profileUser._id).then((posts)=>{
        res.render('profile',{
            currentPage:"posts",
            posts:posts,
            profileUsername:req.profileUser.username,
            profileAvatar:req.profileUser.avatar,
            isFollowing:req.isFollowing,
            isVisitorsProfile : req.isVisitorsProfile,
            counts:{postCount:req.postCount,followersCount:req.followersCount,followingCount:req.followingCount}
        })
    }).catch(()=>{
        res.render('404')
    })
        
   
}


exports.profileFollowersScreen = async function(req,res){
    try{
        let followers  = await Follow.getFollowersById(req.profileUser._id)
        res.render('profile-followers',{
        currentPage:"followers",
        followers:followers,
        profileUsername:req.profileUser.username,
        profileAvatar:req.profileUser.avatar,
        isFollowing:req.isFollowing,
        isVisitorsProfile : req.isVisitorsProfile,counts:{postCount:req.postCount,followersCount:req.followersCount,followingCount:req.followingCount}
    })
    }catch{
        res.render('404')
    }
}

exports.profileFollowingScreen = async function(req,res){
    try{
        let following  = await Follow.getFollowingById(req.profileUser._id)
        res.render('profile-following',{
        currentPage :"following",
        following:following,
        profileUsername:req.profileUser.username,
        profileAvatar:req.profileUser.avatar,
        isFollowing:req.isFollowing,
        isVisitorsProfile : req.isVisitorsProfile,
        counts:{postCount:req.postCount,followersCount:req.followersCount,followingCount:req.followingCount}
    })
    }catch{
        res.render('404')
    }
}