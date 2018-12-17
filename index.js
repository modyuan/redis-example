const path = require('path');
const fs = require('fs');
const http = require('http');
const redis = require('./redisdb');
const ws =require('./ws');


const staticPath = path.join(__dirname, "static");


const MIME = {
    ".json": "application/json",
    ".js": "application/javascript",
    ".css": "text/css",
    ".htm": "text/html",
    ".html": "text/html",
    ".jpg": "image/jpeg",
};

const handlers = {
    "/Count":{"GET":getCount,"POST":addCount}
};
const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
        res.setHeader("Location", "/index.html");
        res.writeHead(301);
        res.end();
        return;
    }
    if (req.url.indexOf("/api") === 0) {
        let h = handlers[req.url.slice(4)];
        if (h) {
            let f=h[req.method];
            if (f) await f(req, res);
            else {
                res.writeHead(403);
                res.end();
            }
        } else {
            res.writeHead(404);
            res.end();
        }
    } else {
        staticFile(req, res);
    }
});

server.listen(8010);

server.on('close', () => {
    console.log("Server closed.");
});

process.on('SIGTERM', () => {
    server.close();
});
process.on('SIGINT', () => {
    server.close();
});

//静态文件服务
function staticFile(req, res) {
    const p = req.url;
    if (p.indexOf('..') >= 0) {

    }
    let ext = path.extname(p);
    let mime = ext ? MIME[ext.toLowerCase()] : "";
    if (mime) {
        res.setHeader('Content-Type', mime);
    }

    let absPath = path.join(staticPath, p);
    if (absPath.indexOf(staticPath) === -1) {
        //禁止访问上层目录
        res.writeHead(403);
        res.end();
        return;
    }
    fs.readFile(absPath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end()
        } else {
            res.write(data);
            res.end();
        }
    });
}

// ----headlers------

async function getCount(req, res) {
    try {
        let num = await redis.getCount();
        res.writeHead(200);
        res.write(num.toString());
    } catch (e) {
        res.writeHead(500);

    }
    res.end();
}

async function addCount(req, res) {
    redis.addCount();
    res.writeHead(200);
    res.end();

}