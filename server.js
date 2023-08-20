import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config()
// Load Node modules
import express from 'express';

import path from 'path';
const __dirname = path.resolve();

const options = {
    headers: {
        'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    method: 'POST'
}

// Initialise Express
let app = express();
// Render static files
app.use(express.json()) 
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
    let email = req.body.email_address;
    let body = JSON.stringify({
        'email_address': email,
        'list_memberships': [process.env.MAIN_EMAIL_LIST]
    });
    options.body = body;
    
    fetch('https://api.cc.email/v3/contacts/sign_up_form', options).then(api_response => {
        console.log(api_response);
    }).catch(error => {
        console.log(error);
    })

})

// Port website will run on
app.listen(process.env.port || 8080);