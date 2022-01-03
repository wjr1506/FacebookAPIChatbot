const addUrl = require("node-fetch");
const request = require("request");
const chanel = "facebook";
const MY_FB_PAGE_TOKEN = "";
const MY_VERIFY_TOKEN = "";
let postWebhook = (req, res) => {
    let body = req.body;
    if (body.object === 'page') {
        body.entry.forEach(function (entry) {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    }else{
        res.sendStatus(404);
    }
};
let getWebhook = (req, res) => {
    let VERIFY_TOKEN = MY_FB_PAGE_TOKEN;
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === MY_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};
let handleMessage = async (sender_psid, received_message) => {
    var user = await getFacebookUsername(sender_psid);
    addUrl(`https://node-red-yrbsr-2021-11-03.mybluemix.net/facebok?mensage=${received_message.text}&usuario=${user}&session=${sender_psid}&origem=${chanel}`)
        .then(res => res.json()).then(async json => {

            json.forEach((item, index) => {
                if(item.text){
                    if(item.text.length > 110){
                        console.log(item.tex)
                        let response = {"text": item.text}
                        setTimeout(() => {callSendAPI(sender_psid, response)}, 900);
                    }
                    else if(item.text == "Se desejar que eu faça mais alguma pesquisa 🔎 digite *Video* ou *Corrigir*."){
                        let response = {"text": "Se desejar que eu faça mais alguma pesquisa 🔎 digite *Video* ou *Corrigir*."}
                        setTimeout(() => {callSendAPI(sender_psid, response)}, 1900);
                    }
                    else if(item.text.length < 109){
                        console.log(item.text)
                        let response = {"text": item.text}
                        setTimeout(() => {callSendAPI(sender_psid, response)}, 500);
                    }
                }
                if (item.title) {   
                    let response = 
                    {   "text": "📲 Opções ou digite o que desejar !",
                        "quick_replies": [
                            {
                                "content_type": "text",
                                "title": "Vídeo de treinamento",
                                "payload": "Vídeo de treinamento",
                            }, {
                                "content_type": "text",
                                "title": "Corrigir um problema",
                                "payload": "Corrigir um problema",
                            }, {
                                "content_type": "text",
                                "title": "Falar com consultor",
                                "payload": "Falar com consultor",
                            }
                        ]
                    }
                    setTimeout(() => { callSendAPI(sender_psid, response) }, 2000);
                }
            });
        })
}
async function callSendAPI  (sender_psid, response) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }
    request({
        "uri": "https://graph.facebook.com/v12.0/me/messages",
        "qs": { "access_token": MY_FB_PAGE_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}
function getFacebookUsername (sender_psid) {
    return new Promise((resolve, reject) => {
        let uri = `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${MY_FB_PAGE_TOKEN}`;
        request({
            "uri": uri,
            "method": "GET",
        }, (err, res, body) => {
            if (!err) {
                body = JSON.parse(body)
                let username = `${body.first_name}`
                resolve(username);
            } else {
                reject("Unable to send message:" + err);
            }
        });
    });
};
module.exports = {
    postWebhook: postWebhook,
    getWebhook: getWebhook
};