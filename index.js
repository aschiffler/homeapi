const express = require('express');
const client = require('twilio')(process.env.accountSid, process.env.authToken);
const bodyParser = require('body-parser');
const Keyv = require('keyv');
const app = express();

function verifyAccess(req, res, next) {
    let keyv = new Keyv('sqlite://database.sqlite');
    keyv.on('error', err => {
        console.log('[keyv] ' + err);
        res.status(400).send('[keyv] ' + err);
    });
    if (req.body.Body == process.env.JOINSECRET)
    {
        keyv.set(req.body.From,true)
        .then((result) => {
            client.messages.create({from: 'whatsapp:' + process.env.botPhone, body: 'you are in', to: req.body.From})
            .then(message => {
                console.log(req.body.From + ' has now access');
                next();
            });
        }, (reason) => {
            console.log('[kevy] ' + reason)
            res.status(200).send('keyv error');
        });    
    } else if (req.body.Body == 'noaccess'){
        console.log('optout for ' + req.body.From)
        keyv.set(req.body.From,false)
        .then((result) => {
            client.messages.create({from: 'whatsapp:' + process.env.botPhone, body: 'you are out', to: req.body.From})
            .then(message => {
                console.log(req.body.From + ' has now no access');
                res.status(200).send('optout');
            });
        }, (reason) => {
            console.log('[kevy] ' + reason)
            res.status(200).send('keyv error');
        });    
    } else {
        keyv.get(req.body.From)
            .then((result) => {
                if (result == true){
                    next();
                }else{
                    client.messages.create({from: 'whatsapp:' + process.env.botPhone, body: 'you have no access. Tell me the magic word', to: req.body.From})
                        .then(message => {
                            console.log(req.body.From + ' has no access');
                            res.status(200).send('no access');
                        });
                }
            }, (reason) => {
                console.log('[kevy] ' + reason)
                res.status(400).send('[kevy] ' + reason);
            });
    }
}

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.post('/api', verifyAccess, (req, res) => {
    client.messages.create({from: 'whatsapp:' + process.env.botPhone, body: 'I do not undestand: ' + req.body.Body, to: req.body.From})
    res.status(200);
});

app.listen(4000, function () {
    if (typeof (PhusionPassenger) !== 'undefined') {
        console.log('App running inside Passenger.');
    } else {
        console.log('App running on port 4000');
    }
});