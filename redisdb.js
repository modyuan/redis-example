const redis = require('redis');
const {promisify} = require('util');

//连接数据库
const client = redis.createClient(6379, 'localhost');

//初始化计数器
client.set("goodCount", '0');

const getA = promisify(client.get).bind(client);

async function getCount() {
    return getA("goodCount");
}

function addCount() {
    client.incr("goodCount");
}

function newClient() {
    return redis.createClient(6379, 'localhost');
}

module.exports = {
    getCount, addCount, newClient
};