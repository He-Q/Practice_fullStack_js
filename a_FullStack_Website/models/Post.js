const { ObjectId } = require('mongodb')
const { on } = require('../db')
const { post } = require('../router')
const User = require('./User')

const postsCollection = require('../db').db().collection('posts')
const ObjectID =  require('mongodb').ObjectID
let Post = function(data,userid,requestedPostId){
    this.data = data
    this.errors = []
    this.userid = userid
    this.requestedPostId = requestedPostId
}

Post.prototype.cleanUp = function(){
    if(typeof(this.data.title)!="string"){
        this.data.title = ""
    }
    if(typeof(this.data.body)!="string"){
        this.data.body = ""
    }
    
    this.data ={
        title : this.data.title.trim(),
        body : this.data.body.trim(),
        createdDate : new Date(),
        author: ObjectID(this.userid)
    }
}

Post.prototype.validate = function(){
    if(this.data.title == ""){
        this.errors.push("Must required")
    }
    if(this.data.body == ""){
        this.errors.push("must required this ")
    }

}

Post.prototype.create = function(){
    return new Promise((resolve,reject)=>{
        this.cleanUp()
        this.validate()
        if(!this.errors.length){
            postsCollection.insertOne(this.data).then(()=>{
                resolve()
            }).catch(()=>{
                this.errors.push("Please try again")
                reject(this.errors)
            })
        }
        else{
            reject(this.errors)
        }
    })
}

Post.prototype.update = function(){
    return new Promise(async (resolve,reject)=>{
        try{
            let post = await Post.findSingleById(this.requestedPostId,this.userid)
            if(post.isVisitorOwner){
                let status = this.autuallyUpdate()
                resolve(status)
            }else{
                reject()
            }
        }catch{
            reject()
        }
    })
}

Post.prototype.autuallyUpdate = function(){
    return new Promise(async (resolve,reject)=>{
        this.cleanUp()
        this.validate()
        if(!this.errors.length){
            await postsCollection.findOneAndUpdate({_id:new ObjectId(this.requestedPostId)},{$set:{title:this.data.title,body:this.data.body}})
            resolve('success')
        }else{
            resolve('faliure')
        }
    })
}

Post.reuseablePostQuery = function(UniqueOpertions,visitorId) {
    return new Promise(async function(resolve, reject) {
      
        let aggOperations = UniqueOpertions.concat([
            {$lookup:{from:'users',foreignField:"_id",localField:'author',as:'authorDocument'}},
            {$project:{
                title:1,
                body:1,
                createdDate:1,
                authorId:"$author",
                author:{$arrayElemAt:['$authorDocument',0]}
            }}
        ])

      let posts= await postsCollection.aggregate(aggOperations).toArray()

      posts = posts.map(function(post){
          post.isVisitorOwner = post.authorId.equals(visitorId)
          post.author = {
              username:post.author.username,
              avatar: new User(post.author,true).avatar
          }
          return post
      })

       resolve(posts)
    })
  }

Post.findSingleById = function(id,visitorId) {
    return new Promise(async function(resolve, reject) {
      if (typeof(id) != "string" || !ObjectID.isValid(id)) {
        reject()
        return
      }
      
      let posts = await Post.reuseablePostQuery([
          {$match:{_id: new ObjectID(id)}}
      ],visitorId)

      if (posts.length) {
        console.log(posts[0])
        resolve(posts[0])
      } else {
        reject()
      }
    })
  }

Post.findByAuthorId = function(authorId){
    return Post.reuseablePostQuery([
        {$match:{author:authorId}},
        {$sort:{
            createdDate:-1
      }}
    ]
    )
}
module.exports = Post