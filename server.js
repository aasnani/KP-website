import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config()
// Load Node modules
import express from 'express';
import nodemailer from 'nodemailer';

import path from 'path';
const __dirname = path.resolve();

global.options = {}

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

const refresh_options = {
    headers: {
        'Authorization': 'Basic ' + process.env.BASE64_ENCODE,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
    },
    method: 'POST'
}

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

function refreshToken() {
    global.options = {
        headers: {
            'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN,
            'Content-Type': 'application/json',
        },
        method: 'POST'
    };
    fetch(`https://authz.constantcontact.com/oauth2/default/v1/token?refresh_token=${process.env.REFRESH_TOKEN}&grant_type=refresh_token`, refresh_options).then(response => {
        let o2 = Object.assign({}, options);
        // console.log(response);
        response.json().then(json => {
            o2.headers['Authorization'] = 'Bearer ' + json['access_token'];
            console.log("Here");
            global.options = o2;
            console.log("ready");
        });
    }).catch(err => {
        console.log(err);
    })
}

refreshToken();

app.post('/addToEmailList', (req, res) => {
    let email = req.query.email_address;
    let body = JSON.stringify({
        'create_source': 'Contact',
        'email_address': email,
        'list_memberships': [process.env.MAIN_EMAIL_LIST]
    });
    global.options.body = body;

    console.log(global.options);
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
    }).finally(() => {
        options.body = null;
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