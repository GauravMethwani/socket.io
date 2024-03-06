const express = require('express');
const app = express();
const secretKey = 'your-secret-key';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const http = require('http').Server(app);
const io = require('socket.io')(http);
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const onlineUsers = new Set();
const User = require('./models/user');
let new_user_id = "";
let active_users = {};
// MongoDB connection setup

const env = require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (!err) {
    console.log('MongoDB Connection Succeeded.');
  } else {
    console.log('Error in DB connection : ' + err);
  }
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {});

// Express session setup
const sessionMiddleware = session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
});

app.use(sessionMiddleware);

// View engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the 'views' directory
app.use(express.static(__dirname + '/views'));

// Include your routes
const index = require('./routes/index');
app.use('/', index);
app.get('/login', function (req, res, next) {
  return res.render('login.ejs');
});

app.post('/login', async function (req, res, next) {
 
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const passwordMatch = await bcrypt.compare(req.body.password, user.password);

      if (passwordMatch) {
        // Generate token
        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

        // Store the token in the session
        req.session.token = token;
        req.session.userId = user._id;
        active_users[user._id] = user.firstName;
        res.send({ "Success": "Success!" });
      } else {
        res.send({ "Success": "Wrong password!" });
      }
    } else {
      res.send({ "Success": "This Email Is not registered!" });
    }
  } catch (error) {
    console.error("Error: " + error);
    res.status(500).send({ "Success": "Internal server error." });
  }
});


// Socket.IO handling
io.on("connection", (socket) => {
  console.log("CONNECTED TO SOCKET", socket.id);

  let fname = ""; // Declare fname variable in the connection scope

  socket.join("live-users");

  socket.on("name", (name) => {
    // fname = name; // Update fname when receiving the name event
    // id_nd_name[new_user_id]=name;
    // console.log(new_user_id,'line 181')
    active_users[new_user_id] = name;

    // active_users.push(id_nd_name);

    // Object.assign(active_users, id_nd_name);
    console.log("PUSHED TO THE ARRAY");
    console.log(active_users);
  });

  socket.on("fetch-data", async (id) => {
    console.log("Got data", id);

    const userId = id;
    console.log("Line 199", userId);
    try {
      // Fetch user details from MongoDB using Mongoose
      const user = await UserModel.findById(userId);
      if (!user) {
        console.log("User not found");
        socket.emit("user-not-found", userId); // Emit an event indicating that user is not found
        return; // Exit the function if user is not found
      }
      // Log the user details
      console.log("User found:", user);
      socket.emit("user-details", user); // Emit user details back to the client
    } catch (err) {
      console.error("Error fetching user details:", err);
      // Handle the error appropriately
    }
  });

  socket.on("disconnect", () => {
    if (active_users.hasOwnProperty(new_user_id)) {
      delete active_users[new_user_id];
    }
  });

  socket.emit("connected-users", active_users);
});

// Define a GET route to retrieve the list of online users
app.get('/online-users', (req, res) => {
  res.render("data", { active_users });
  console.log({active_users});
});
// Start the server and listen on a port
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`Server is started on http://127.0.0.1:${PORT}`);
});
