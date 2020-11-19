
let express = require('express')
let mongodb = require('mongodb')
let santizieHTML = require('sanitize-html')

let app = express()
let db
let port = process.env.PORT

if (port == null || port == "") {
  port = 3000
}

let connectionString = 'mongodb+srv://todoAppUser:james@cluster0.jkc34.mongodb.net/TodoApp?retryWrites=true&w=majority'
mongodb.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  db = client.db()
  app.listen(port)

})
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


function passwordProtection(req, res, next) {
  res.set('WWW-Authenticate', 'Basic relam = "Simple TODO APP"')
  console.log(req.headers.authorization)
  if (req.headers.authorization == 'Basic Qk9ORDowMDc=') {
    next()
  } else {
    res.status(401).send("Authentication Required.... Uhmmm...  MAN LOST  IN SPACE")
  }

}

app.use(passwordProtection)

app.get('/', function (req, res) {
  db.collection('items').find().toArray(function (err, items) {
    res.send(`<!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Movie Lists to Follow</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
  </head>
  <body>
  <div class="container">
  <h1 class="display-4 text-center py-1">Movies List</h1>
  
  <div class="jumbotron p-3 shadow-sm">
  <form id="create-form" action="/create-item" method="POST">
  <div class="d-flex align-items-center">
  <input id="create-field" name = "item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
  <button class="btn btn-primary">Add Movie</button>
  </div>
  </form>
  </div>
  
  <ul id="item-list" class="list-group pb-5"> 
    </ul>
    
  </div>
  <script>
  let items = ${JSON.stringify(items)}
  </script>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

  <script src="/browser.js"></script>
</body>
</html>`)
  })
})

app.post('/create-item', function (req, res) {
  let safeText = santizieHTML(req.body.text, { allowedTags: [], allowedAttributes: {} })
  db.collection('items').insertOne({ text: safeText }, function (err, info) {
    res.json(info.ops[0])
  })
})


app.post('/update-item', function (req, res) {
  let safeText = santizieHTML(req.body.text, { allowedTags: [], allowedAttributes: {} })
  db.collection('items').findOneAndUpdate({ _id: new mongodb.ObjectId(req.body.id) }, { $set: { text: safeText } }, function () {
    res.send("Success")
  })
})

app.post('/delete-item', function (req, res) {
  db.collection('items').deleteOne({ _id: new mongodb.ObjectId(req.body.id) }, function () {
    res.send("Success")
  })
})