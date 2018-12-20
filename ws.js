const WebSocket = require('ws');
const redis = require('./redisdb');


const wss = new WebSocket.Server({port:'8011',host:'0.0.0.0'});
const wss2 = new WebSocket.Server({port:'8012',host:'0.0.0.0'});


let onlinePeople = 0;

function getOnlinePeople(){
    return onlinePeople;
}



//only for post message
wss.on('connection',(ws)=>{
    //console.log("a link built.");
    onlinePeople +=1;
    ws.redis = redis.newClient();

    //subscribe the public channel
    ws.redis.subscribe("public");



    //when get message from channel ,forward it to client.
    ws.redis.on('message',function(channel,message){
       ws.send(message);
    });

    ws.on('close',()=>{
        ws.redis.quit();
        onlinePeople-=1;
        //console.log("a link quited.");
    });
    ws.on('error',()=>{
        ws.close();
    });

});
wss.on("error", ()=>{
    console.log("wss1 error!");
    wss.close();
});


//only for recv message
wss2.on('connection',(ws)=>{
    //console.log("a link built.");

    ws.redis = redis.newClient();


    //fetch last 5 messages.

    ws.on('message',function(message){
        ws.redis.publish('public',message);
        ws.redis.lpush("last",message);
        ws.redis.ltrim("last",0,4);
    });
    ws.on('close',()=>{
        ws.redis.quit();
        //console.log("a link quited.");
    });
    ws.on('error',()=>{
        ws.close();
    });

});
wss2.on("error", ()=>{
    console.log("wss2 error!");
    wss.close();
});

function quit(){
    wss.close();wss2.close();onlinePeople=0;
}

module.exports={
    quit,getOnlinePeople
};