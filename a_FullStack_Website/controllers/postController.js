const Post = require('../models/Post')

exports.viewCreateScreen = function(req,res){
    res.render('create-post')
}


exports.create = function(req,res){
    let post = new Post(req.body,req.session.user._id)
    post.create().then((newId)=>{
        req.flash('success','Post Succesfully created')
            req.session.save(function(){
                res.redirect(`/post/${newId}`)
            })
    }).catch((errors)=>{
        errors.forEach(function(err){
            req.flash('errors',err)
        })
        req.session.save(function(){
            res.redirect('/create-post')
        })
    })
}

exports.apiCreate = function(req,res){
    let post = new Post(req.body,req.apiUser._id)
    post.create().then((newId)=>{
        res.json("congrates")
    }).catch((errors)=>{
        res.json(errors)
    })
}

exports.viewSingle = async function(req,res){
    try{
    let post = await Post.findSingleById(req.params.id,req.visitorId)
    res.render('single-post-screen', {post: post})
    }catch{
    res.render("404")
    }
}

exports.viewEditScreen  = async function(req,res){
    try{
        let post = await Post.findSingleById(req.params.id,req.visitorId)
        if (post.isVisitorOwner){
            res.render('edit-post', {post: post})
        }else{
            req.flash('errors',"You Do not have permission to perform that action")
            req.session.save(function(){
                res.redirect('/')
            })
        }
        }catch{
        res.render("404")
        }
}

exports.edit = function(req,res){
    let post = new Post(req.body,req.visitorId,req.params.id)
    post.update().then((status)=>{
        if(status == "success"){
            req.flash('success','Post Succesfully Updated')
            req.session.save(function(){
                res.redirect(`/post/${req.params.id}/edit`)
            })
        }else{
            post.errors.forEach(function(err){
                req.flash('errors',err)
            })
            req.session.save(function(){
                res.redirect(`/post/${req.params.id}/edit`)
            })
        }
    }).catch(()=>{
        re.flash('errors',"You Do not have permission to perform that action")
        req.session.save(function(){
            res.redirect('/')
        })
    })
}

exports.delete = function(req,res){
    Post.delete(req.params.id,req.visitorId).then(()=>{
        req.flash("success","Post SuccessFully deleted.")
        req.session.save(()=>{
            res.redirect(`/profile/${req.session.user.username}`)
        })
    }).catch(()=>{
        req.flash('errors',"You Do not have permission to perform that action")
        req.session.save(function(){
            res.redirect('/')
        })
    })
}

exports.apiDelete = function(req,res){
    Post.delete(req.params.id,req.apiUser._id).then(()=>{
       res.json("successssssssss")
    }).catch(()=>{
        res.json("You Do not have permission to perform that action")
    })
}

exports.search = function(req,res){
    Post.search(req.body.searchTerm).then((posts)=>{
        res.json(posts)
    }).catch(()=>{
        res.json([])
    })
}