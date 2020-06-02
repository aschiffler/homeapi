const express = require('express');
const client = require('twilio')(process.env.accountSid, process.env.authToken);
const bodyParser = require('body-parser');
const Keyv = require('keyv');
const app = express();

function verifyAccess(req, res, next) {
    let keyv = new Keyv('sqlite://database.sqlite');
    keyv.on('error', err => {
        console.log('Connection to keyv store Error', err);
        res.status(400);
    });
    console.log('verify')
    if (req.body.Body == process.env.JOINSECRET)
    {
        console.log('magicword')
        keyv.get('validPhones')
        .then((result) => {
            console.log(result);
            let newPhoneNumbers  = result.push(req.body.From);
            keyv.set('validPhones',newPhoneNumbers).then((result) =>{
                client.messages.create({from: 'whatsapp:' + process.env.botPhone, body: 'you are in', to: req.body.From}).then(message => console.log(req.body.From + ' has joined'));
                next();
            })
        }, (reason) => {
            console.log('[kevy reject] ' + reason)
            res.status(200).send('keyv error');
        });    
    } else {
        keyv.get('validPhones')
            .then((result) => {
                if (1){
                    console.log(req.body.From);
                    next();
                }else{
                    client.messages.create({from: 'whatsapp:' + process.env.botPhone, body: 'you are in', to: req.body.From})
                        .then(message => {
                            console.log(req.body.From + ' has no access');
                            res.status(200).send('no access');
                        });
                }
            }, (reason) => {
                console.log('[kevy reject] ' + reason)
                res.status(400);
            });
    }
}

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.post('/api', verifyAccess, (req, res) => {
    console.log(req.body);
    res.status(200);
});

app.listen(4000, function () {
    if (typeof (PhusionPassenger) !== 'undefined') {
        console.log('App running inside Passenger.');
    } else {
        console.log('App running on port 4000');
    }
});