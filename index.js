const express = require('express');
const app = express();
const log = require('./utils');
const fs = require('fs');
const bodyParser = require('body-parser');
// 解析 form-data
const multer = require('multer');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017/todosDb';
// 全局变量
let i = 0;

// Express托管静态文件
app.use(express.static('./public'));

// 读取 html 文件的函数
const template = (name) => {
    const path = './templates/' + name;
    const options = {
        encoding: 'utf8'
    };
    const content = fs.readFileSync(path, options);
    return content
};

app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html');
    let body = template('./todo.html');
    res.send(body);
    res.end()
});

// body-parser 需写在路由外面
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json

app.post('/add', (req, res) => {
    // app.use(multer()); // for parsing multipart/form-data
    // 解析收到的请求数据
    let body = req.body;
    let item = body.item
    // 将要存储的数据
    let todo = {
        item: item,
        id: i,
        done: false
    };
    // id自加一
    i++;
    // 将数据存入数据库中
    MongoClient.connect(url, (error, db) => {
        const collection = db.collection('todosDb');
        collection.insertOne(todo, (error, result) => {
            let r = result.ops[0]
            res.send(r)
        })
    })
    // 读取数据，显示到页面上
});

app.post('/delete', (req, res) => {
    // app.use(multer()); // for parsing multipart/form-data
    // 解析收到的请求数据
    let body = req.body;
    let item = body.item
    let id = JSON.parse(body.id)
    // 将要存储的数据
    let todo = {
        id: id
    };
    // 将数据存入数据库中
    MongoClient.connect(url, (error, db) => {
        const collection = db.collection('todosDb');
        collection.deleteOne(todo, (error, result) => {
            res.send('删除成功')
        })
    })
});

app.post('/edit', (req, res) => {
    let body = req.body
    let id = JSON.parse(body.id)
    let item = body.item
    // 将要存查找的数据
    let todo = {
        id: id
    };
    let form = {
        $set: {
            item: item,
        }
    };
    // 在数据库中查找数据
    MongoClient.connect(url, (error, db) => {
        const collection = db.collection('todosDb');
        collection.updateOne(todo, form, (error, result) => {
            res.send('修改成功')
        })
    })
});

app.get('/get', (req, res) => {
    // 在数据库中查找数据
    MongoClient.connect(url, (error, db) => {
        const collection = db.collection('todosDb');
        collection.find().toArray((error, result) => {
            log('get: result\n', result)
            res.send(result)
        })
    })
});

app.post('/finish', (req, res) => {
    let body = req.body
    let id = JSON.parse(body.id)
    let done = JSON.parse(body.done)
    // 将要存查找的数据
    let todo = {
        id: id
    };
    // 在数据库中查找数据
    // db.users.update({username: 'smith'}, {$set: {country: 'Canada'}})
    MongoClient.connect(url, (error, db) => {
        const collection = db.collection('todosDb');
        collection.updateOne(todo, {$set: {done: done}}, (error, result) => {
            log(result)
            res.send('完成状态修改成功')
        })
    })
});

const server = app.listen(3001, () => {
   const host = server.address().address;
   const port = server.address().port;

   log(`http://${host}:${port}`);
});