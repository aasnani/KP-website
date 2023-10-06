import dotenv from 'dotenv';
import fetch from 'node-fetch';
import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import pino from 'pino';
import moment from 'moment';

dotenv.config();

//Definitions
const __DIRNAME = path.resolve();

const ENV_LEVEL = process.env.NODE_ENV;
const LOG_LEVEL = process.env.LOG_LEVEL;

const date_string = moment().format("YYYY-MM-DD HH:mm:ss");

const NODEMAILER_EMAIL_SETTINGS = { 
  name: process.env.HOST,
  host: process.env.HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.CONTACT_US_EMAIL,
    pass: process.env.CONTACT_US_PW,
  }
};

const CC_ADD_CONTACT_ENDPOINT = 'https://api.cc.email/v3/contacts/sign_up_form';

const MAIL_LIST_ID = process.env.MAIN_EMAIL_LIST;

const CC_REFRESH_INFO = {
  url: `https://authz.constantcontact.com/oauth2/default/v1/token?refresh_token=${process.env.REFRESH_TOKEN}&grant_type=refresh_token`,
  options: {
    headers: {
      'Authorization': 'Basic ' + process.env.BASE64_ENCODE,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    method: 'POST'
  }
};

let CC_DATA_ACCESS_HEADERS = {
  'Content-Type': 'application/json',
};

//Helper functions

const create_contact_json_string = (email) => {
  let body = {
    'create_source': 'Contact',
    'email_address': email,
    'list_memberships': [MAIL_LIST_ID]
  };

  return JSON.stringify(body);
};

const create_nodemailer_mail_object = (name, email, phone, message) => ({
  from: process.env.CONTACT_US_EMAIL,
  to: process.env.CONTACT_US_DESTINATION,
  subject: `Contact Us Form: ${name}`,
  text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
});

const refresh_access_token = async () => {
  const response = await fetch(CC_REFRESH_INFO.url, CC_REFRESH_INFO.options);
  const response_json = await response.json();
  
  CC_DATA_ACCESS_HEADERS['Authorization'] = 'Bearer ' + response_json['access_token'];
};

const get_options_object = (method, body) => {
  let headers_clone = Object.assign({}, CC_DATA_ACCESS_HEADERS);
  let options = {
    headers: headers_clone,
    method: method
  }
  if (body != undefined) {
    options.body = body;
  }
  return options;
};

//Set-up
const transport = pino.transport({
  targets: [
    {
      target: 'pino/file',
      options: { 
        destination: `${__DIRNAME}/logs/app-${date_string}.log` 
      },
      level: LOG_LEVEL
    },
    {
      target: 'pino-pretty',
      level: LOG_LEVEL
    },
  ],
});
const logger = pino({ level: LOG_LEVEL}, transport);
logger.info("Logging started!");

const transporter = nodemailer.createTransport(NODEMAILER_EMAIL_SETTINGS);

transporter.verify(function (error, success) {
  if (error) {
    logger.error({error}, "Error with nodemailer transporter");
  } else {
    logger.info("Nodemailer successfully set-up and verified");
  }
});

// await refresh_access_token();
// logger.info("Refresh token acquired");

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

//Routes

app.get('/', (req,res) => {
  res.sendFile(__DIRNAME + '/index.html');
})

app.get('/new-arrivals', (req,res) => {
  res.sendFile(__DIRNAME + '/new-arrivals.html');
})

app.post('/addToEmailList', (req, res) => {
  logger.info("/addToEmailList - Request received");
  let email = req.query.email_address;
  let add_contact_body = create_contact_json_string(email);
  logger.debug({add_contact_body}, "/addToEmailList - CC Payload");
  
  fetch(CC_ADD_CONTACT_ENDPOINT, get_options_object('POST', add_contact_body)).then(async api_response => {
    if(api_response.status == 401){
      await refresh_access_token();
      let response = await fetch(CC_ADD_CONTACT_ENDPOINT, get_options_object('POST', add_contact_body));

      if(response.status == 200 | response.status == 201) {
        logger.info(`/addToEmailList - CC Request handled with retry - Status:${response.status}`);
        logger.debug({response}, "Response body of successful CC request after retry");
        res.status(201).json({'status': 'success'});
      }
      else {
        logger.error(`/addToEmailList - CC Request failed to be handled with retry - Status:${response.status}`);
        logger.debug({response}, "Response body of failed CC request after retry");
        res.status(500).json({'status': 'failure'});
      }
    } 
    else {
      logger.info(`/addToEmailList - CC Request handled - Status:${response.status}`);
      logger.debug({response}, "Response body of successful CC request");
      res.status(201).json({'status': 'success'});
    }
  }).catch(async error => {
    logger.error(`/addToEmailList - CC Request failed to be handled - Status:${response.status}`);
    logger.debug({response}, "Response body of failed CC request");
    res.status(500).json({'status': 'failure'});
  })
});

app.post('/sendContactUs', (req, res) => {
  logger.info("/sendContactUs - Request received");
  let name = req.body.name;
  let email = req.body.email;
  let phone = req.body.phone;
  let message = req.body.message;

  const mail = create_nodemailer_mail_object(name, email, phone, message);

  logger.debug({mail}, "/sendContactUs - Email Payload");

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      logger.error({err}, "/sendContactUs - Email request failed to be handled");
      res.status(500).json({'status': 'failure'});
    } else {
      logger.info({data}, "/sendContactUs - Email request successfully handled");
      res.status(200).json({'status': 'success'});;
    }
  });
});

// Port website will run on
logger.info("App Starting")
app.listen(process.env.port || 8080);