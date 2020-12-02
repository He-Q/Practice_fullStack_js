const express = require('express')
const router = express.Router()

const userController = require('./controllers/userController')
const postController = require('./controllers/postController')


router.get('/',userController.home)
router.post('/register',userController.register)
router.post('/login',userController.login)
router.post('/logout',userController.logout)

// post releated controllers

router.get('/create-post',userController.mustBeLoggedIn,postController.viewCreateScreen)
router.post('/create-post',userController.mustBeLoggedIn,postController.create)
router.get('/post/:id',postController.viewSingle)
router.get('/post/:id/edit',postController.viewEditScreen)
router.post('/post/:id/edit',postController.edit)

// profile releated conrollers

router.get('/profile/:username',userController.ifUserExists,userController.profilePostsScreen)

module.exports = router