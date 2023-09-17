const express = require('express');
const pug = require('pug');
const fs = require('fs');
const app = express();
const port = 3000;
const mysql = require("mysql"); // mysql 모듈을 불러옵니다.

// 커넥션을 정의합니다.
// RDS Console 에서 본인이 설정한 값을 입력해주세요.
const connection = mysql.createConnection({
  host: "keung-rds.colgpa78bwcs.ap-northeast-2.rds.amazonaws.com",
  user: "admin",
  password: "!Dkagh00",
  database: "keung"
});

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.static('src'));

const mockUserId = '00000';

app.get('/', (req, res) => {
  const tagMockData = JSON.parse(fs.readFileSync('src/mock/tags.json', 'utf8'));
  const reviewMockData = JSON.parse(fs.readFileSync('src/mock/reviews.json', 'utf8'));
  res.render('index', { tags: tagMockData, reviews: reviewMockData });
});

app.get('/user', (req, res) => {
  // const markup = pug.render('p#main-hello  이지민님! 어떤 식당을 찾으시나요?')
  // res.send(markup);
});

app.post("/test", (req, res) => {
  let template = pug.compileFile("views/pages/test.pug");
  res.send(template());
});

app.post("/dbtest", (req, res) => {
  let template = pug.compileFile("views/pages/dbtest.pug");
  let time;

  connection.connect(function(err) {  
    try{
      // 접속시 쿼리를 보냅니다.
      connection.query("SELECT NOW() AS time FROM DUAL", function(err, rows, fields) {
        time = rows[0].time;
        console.log(rows[0].time);
        res.send(template({serverTime: time}));
      });
    }catch (e){
      console.log(e);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
