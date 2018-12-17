const WebSocket = require('ws');
const redis = require('./redisdb');


const wss = new WebSocket.Server({port:'8011',host:'0.0.0.0'});
wss.redis = redis.newClient();

wss.on('connection',(ws)=>{
    console.log("a link built.");

    ws.redis = redis.newClient();
    ws.redis.subscribe("public");
    ws.redis.on('message',function(channel,message){
       ws.send(message);
    });

    ws.on('message',(msg)=>{
        ws.redis.publish('public',msg);
    });
    ws.on('close',()=>{
        ws.redis.quit();
        console.log("a link quited.");
    })

});