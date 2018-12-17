const WebSocket = require('ws');
const redis = require('./redisdb');


const wss = new WebSocket.Server({port:'8011',host:'0.0.0.0'});
wss.redis = redis.newClient();

const wss2 = new WebSocket.Server({port:'8012',host:'0.0.0.0'});



//only for post message
wss.on('connection',(ws)=>{
    //console.log("a link built.");

    ws.redis = redis.newClient();
    ws.redis.subscribe("public");
    ws.redis.on('message',function(channel,message){
       ws.send(message);
    });
    ws.on('close',()=>{
        ws.redis.quit();
        console.log("a link quited.");
    })

});
//only for recv message
wss2.on('connection',(ws)=>{
    console.log("a link built.");

    ws.redis = redis.newClient();
    ws.on('message',function(message){
        ws.redis.publish('public',message);
    });
    ws.on('close',()=>{
        ws.redis.quit();
        //console.log("a link quited.");
    })

});
