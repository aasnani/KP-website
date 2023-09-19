import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config()
// Load Node modules
import express from 'express';
import nodemailer from 'nodemailer';

import path from 'path';
const __dirname = path.resolve();

const options = {
    headers: {
        'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN,
        'Content-Type': 'application/json',
    },
    method: 'POST'
}

const transporter = nodemailer.createTransport({
  name: process.env.HOST,
  host: process.env.HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.CONTACT_US_EMAIL,
    pass: process.env.CONTACT_US_PW,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

const SUBJECT_FORMAT = "Contact Us Form: "


// Initialise Express
let app = express();
// Render static files
app.use(express.json());
app.use(express.static('index.html'));
app.use('/css', express.static('css'));
app.use('/fonts', express.static('fonts'));
app.use('/images', express.static('images'));
app.use('/imagesbaup', express.static('imagesbaup'));
app.use('/js', express.static('js'));
app.get('/', (req,res) => {
    res.sendFile(__dirname + '/index.html');
})

app.post('/addToEmailList', (req, res) => {
    let email = req.query.email_address;
    let body = JSON.stringify({
        'create_source': 'Contact',
        'email_address': email,
        'list_memberships': [process.env.MAIN_EMAIL_LIST]
    });
    options.body = body;

    console.log(options);
    fetch('https://api.cc.email/v3/contacts/sign_up_form', options).then(api_response => {
        console.log(api_response);
        res.json({
            'status': 'success'
        });
    }).catch(error => {
        console.log(error);
        res.json({
            'status': 'fail'
        });
    })
})

app.post('/sendContactUs', (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let phone = req.body.phone;
  let message = req.body.message;

  const mail = {
    from: process.env.CONTACT_US_EMAIL,
    to: process.env.CONTACT_US_DESTINATION,
    subject: SUBJECT_FORMAT + name,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
  };

  console.log(mail);

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Something went wrong.");
    } else {
      res.status(200).send("Email successfully sent to recipient!");
      console.log("Success");
    }
  });
})

// Port website will run on
app.listen(process.env.port || 8080);