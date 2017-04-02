'use strict';

const express    = require('express')
const app        = express()
const path       = require("path");
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer');
const validator = require('validator');

// create reusable transporter object using the default SMTP transport
let transporter  = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.gmailUser,
        pass: process.env.gmailPass
    }
});

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'pug')
app.set('views', './static')
app.get('/', function (req, res) {
  var success = req.query.success
  res.render('index', {success: success})
})

app.post('/contact', function (req, res){
  let name = req.body.name; 
  let email = req.body.email; 
  let message = req.body.message;

  var valueString = "&name=" + name + "&email=" + email + "&message=" + message

  if (!validator.isAscii(name)) {
    res.redirect("/contact?error=name" + valueString); 
    return
  } else if (!validator.isEmail(email)) {
    res.redirect("/contact?error=email" + valueString); 
    return
  } else if (message == "") {
    res.redirect("/contact?error=message" + valueString)
    return 
  }

  let mailOptions = {
    from: '"' + name + '" <'+email+'>', // sender address
    to: process.env.ToEmail, // list of receivers
    subject: '2-Sides Inquiry ✔', // Subject line
    text: message, // plain text body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    res.redirect("/?success=true")
  });
});

app.get('/contact', function (req, res){
  res.render('contact', {error: req.query.error, name: req.query.name, email: req.query.email, message: req.query.message})
}); 

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});