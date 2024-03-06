const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const io = require('../socket');
const secretKey = 'your-secret-key'; // Change this to a secure random key
const sharedState = require('../sharestate')
sharedState.setIo(io);
router.get('/', function (req, res, next) {
  return res.render('index.ejs');
});

router.post('/', async function (req, res, next) {
  console.log(req.body);

  const {
    firstName,
    lastName,
    mobileNumber,
    email,
    street,
    city,
    state,
    country,
    username,
    password,
    passwordConf,
  } = req.body;
  
  try {
    if (password === passwordConf) {
      const existingUser = await User.findOne({ email: email });

      if (!existingUser) {
        const saltRounds = 10;
        const hashPasswords = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
          firstName: firstName,
          lastName: lastName,
          mobileNumber: mobileNumber,
          email: email,
          street: street,
          city: city,
          state: state,
          country: country,
          username: username,
          password: hashPasswords,
          passwordConf: hashPasswords,
        });

        console.log('User registered successfully');
        res.send({ "Success": "You are registered, You can login now." });
      } else {
        res.send({ "Success": "Email is already used." });
      }

    } else {
      res.send({ "Success": "Passwords do not match." });
    }
  } catch (error) {
    console.error("Error: " + error);
    res.status(500).send({ "Success": "Internal server error." });
  }
});

// router.get('/login', function (req, res, next) {
//   return res.render('login.ejs');
// });

// router.post('/login', async function (req, res, next) {
//   const io = sharedState.getIo();
//   try {
//     const user = await User.findOne({ email: req.body.email });

//     if (user) {
//       const passwordMatch = await bcrypt.compare(req.body.password, user.password);

//       if (passwordMatch) {
//         // Generate token
//         const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

//         // Store the token in the session
//         req.session.token = token;
//         req.session.userId = user._id;

//         res.send({ "Success": "Success!" });
//       } else {
//         res.send({ "Success": "Wrong password!" });
//       }
//     } else {
//       res.send({ "Success": "This Email Is not registered!" });
//     }
//   } catch (error) {
//     console.error("Error: " + error);
//     res.status(500).send({ "Success": "Internal server error." });
//   }
// });
//router.get('/profile', async function (req, res, next) {
//   const io = sharedState.getIo();

//   if (!io) {
//     return res.status(500).send({ "Error": "Socket.io not properly initialized" });
//   }

//   const token = req.session.token;

//   if (!token) {
//     return res.status(401).send({ "Error": "Unauthorized" });
//   }

//   try {
//     const decoded = jwt.verify(token, secretKey);
//     const userId = decoded.userId;

//     const user = await User.findOne({ _id: userId });

//     if (!user) {
//       return res.status(404).send({ "Error": "User not found" });
//     }

//     console.log("User found:", user);

//     const activeUsers = [];

//     // Access connected sockets directly using io.sockets
//     const socketsArray = Object.values(io.sockets.sockets);

//     for (const socket of socketsArray) {
//       console.log("1");
//       if (socket.request && socket.request.session && socket.request.session.userId) {
//         console.log("Found active user:", socket.request.session.userId);
//         activeUsers.push(socket.request.session.userId);
//       }
//     }

//     console.log("Active Users:", activeUsers);

//     res.render('data', {
//       "user": user,
//       "activeUsers": activeUsers
//     });
//   } catch (error) {
//     console.error("Error: " + error);
//     res.status(401).send({ "Error": "Invalid token" });
//   }
// });


router.get('/logout', function (req, res, next) {
  console.log("logout");
  req.session.destroy(function (err) {
    if (err) {
      return next(err);
    } else {
      return res.redirect('/');
    }
  });
});

router.get('/forgetpass', function (req, res, next) {
  res.render("forget.ejs");
});

router.post('/forgetpass', function (req, res, next) {
  User.findOne({ email: req.body.email }, function (err, data) {
    console.log(data);
    if (!data) {
      res.send({ "Success": "This Email Is not registered!" });
    } else {
      if (req.body.password == req.body.passwordConf) {
        data.password = req.body.password;
        data.passwordConf = req.body.passwordConf;

        data.save(function (err, Person) {
          if (err)
            console.log(err);
          else
            console.log('Success');
          res.send({ "Success": "Password changed!" });
        });
      } else {
        res.send({ "Success": "Password does not matched! Both Password should be the same." });
      }
    }
  });
});

module.exports = router;
