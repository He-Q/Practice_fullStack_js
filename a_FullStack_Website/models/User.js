const usersCollection = require('../db').db().collection('users')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const db = require('../db')
const md5  = require('md5')

let User = function(data){
    this.data = data
    this.errors = []
}

User.prototype.cleanUp = function(){
    if(typeof(this.data.username) != 'string'){
        this.data.username = ""
    }
    if(typeof(this.data.email) != 'string'){
        this.data.email = ""
    }
    if(typeof(this.data.password) != 'string'){
        this.data.password = ""   
    }

    this.data = {
        username : this.data.username.trim().toLowerCase(),
        email:this.data.email.trim().toLowerCase(),
        password:this.data.password
    }
    
}

User.prototype.validate = function(){
    return new Promise(async (resolve,reject)=>{
        if(this.data.username == ""){
            this.errors.push('please put a valid a username')
        }
        if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)){
         this.errors.push('Only Contains certian char and numbers')
        }
        if(this.data.username.length > 0 && this.data.username.length < 3){
         this.errors.push(' USername Must contains 3 letters ')
         }
     
         if(this.data.username.length > 30){
             this.errors.push("Username cannot exceed 30 characters")
         }
     
     
     
        if(validator.isEmail(this.data.email) == ""){
         this.errors.push('please put a valid a email')
        }
     
     
        if(this.data.password == ""){
         this.errors.push('please put a valid a password')
         }
         
         if(this.data.password.length > 0 && this.data.password.length < 6){
             this.errors.push(' password Must contains 6 char ')
         }
         if(this.data.password.length > 50){
             this.errors.push('password cannot exceed 30 characters')
         }
     
         if(this.data.username.length < 2 && this.data.username.length < 31 && validator.isAlphanumeric(this.data.username)){
             let userExist  = await usersCollection.findOne({username:this.data.username})
             if(userExist){
                 this.errors.push("Alerady taken username")
             }
         }
         
         if(validator.isEmail(this.data.email)){
             let emailExist  = await usersCollection.findOne({email:this.data.email})
             if(emailExist){
                 this.errors.push("Alerady taken email")
             }
         }
         resolve()
     })
}


User.prototype.login =  function(){
    return new Promise((resolve,reject)=>{
        this.cleanUp()
        usersCollection.findOne({username:this.data.username}).then((attemptedUser)=>{
            if(attemptedUser){
            attemptedUser && bcrypt.compareSync(this.data.password,attemptedUser.password)
            this.data = attemptedUser
            this.getAvatar()
            resolve("Hell Yeah")
            }
            else{
                reject("Invalid username / password.")
            }
            }).catch(()=>{
                reject("Please try again later.")
            })
    })
}


User.prototype.register = function() {
  return new Promise(async (resolve, reject) => {
    // Step #1: Validate user data
    this.cleanUp()
    await this.validate()
  
    // Step #2: Only if there are no validation errors 
    // then save the user data into a database
    if (!this.errors.length) {
      // hash user password
      let salt = bcrypt.genSaltSync(10)
      this.data.password = bcrypt.hashSync(this.data.password, salt)
      await usersCollection.insertOne(this.data)
      this.getAvatar()
      resolve()
    } else {
      reject(this.errors)
    }
  })
}

User.prototype.getAvatar = function(){
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}
module.exports = User