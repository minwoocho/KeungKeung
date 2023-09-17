import express from 'express';
import pug from 'pug';
import fs from 'fs';
import mysql from 'mysql'; // mysql 모듈을 불러옵니다.
const app = express();
const port: number = 3000;

// 커넥션을 정의합니다.
// RDS Console 에서 본인이 설정한 값을 입력해주세요.
const connection = mysql.createConnection({
  host: 'keung-rds.colgpa78bwcs.ap-northeast-2.rds.amazonaws.com',
  user: 'admin',
  password: '!Dkagh00',
  database: 'keung',
});

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.static('src'));

const mockUserId = '00003';

app.get('/', (req, res) => {
  // connection.connect(function() {  
  //   try{
  //     connection.query(
  //       "SELECT TAG_ID as tagId, TAG_NAME as tagName FROM TB_TAG_MASTER", function(err, rows: any[], fields) {
  //         const reviewMockData = JSON.parse(fs.readFileSync('src/mock/reviews.json', 'utf8'));
  //         res.render('index', { tags: rows});
  //     });
  //   }catch (e){
  //     console.log(e);
  //   }
  // });
  // const tagMockData = JSON.parse(fs.readFileSync('src/mock/tags.json', 'utf8'));
  // const reviewMockData = JSON.parse(fs.readFileSync('src/mock/reviews.json', 'utf8'));
  // res.render('index', { tags: tagMockData, reviews: reviewMockData });
  // console.log(tagMockData.data)
  res.render('index')
});

app.get('/user', (req, res) => {
  const userId = mockUserId;
  connection.connect(function () {
    try {
      connection.query(
        'SELECT NAME FROM TB_USER_MASTER WHERE USER_ID = ?',
        [userId],
        function (err, rows, fields) {
          res.send(rows[0].NAME + '님! 어떤 식당을 찾으시나요?');
        }
      );
    } catch (e) {
      console.log(e);
    }
  });
});

app.get('/add-review', (req, res) => {
  let template = pug.compileFile('views/pages/add-review.pug');
  const tagMockData = JSON.parse(fs.readFileSync('src/mock/tags.json', 'utf8'));

  res.send(template({ tags: tagMockData }));
});

app.get('/review', (req, res) => {
  connection.connect(function() {  
    try{
      connection.query(
        "SELECT REVIEW_ID AS cardId FROM TB_REVIEW_MASTER ORDER BY REVIEW_ID DESC", function(err, rows: any[], fields) {

          let template = pug.compileFile('views/components/card-layout.pug');
          res.send(template({datas: rows}));
      });
    }catch (e){
      console.log(e);
    }
  });
});

app.get("/review/:id", (req, res) => {
  const { id } = req.params;
  connection.connect(function() {  
    try{
      connection.query(
      `SELECT
        TRM.REVIEW_ID
        ,TRM.REVIEW_CONTENT as review
        ,TSM.STORE_NAME as storeName
        ,'/assets/photos/mock-picture.png' as photo
        ,TUM.NAME as userName
      FROM TB_REVIEW_MASTER TRM 
      LEFT OUTER JOIN TB_STORE_MASTER TSM ON TRM.STORE_ID  = TSM.STORE_ID  
      LEFT OUTER JOIN TB_IMAGE_MASTER TIM  ON TRM.REVIEW_ID  = TIM.REVIEW_ID
      LEFT OUTER JOIN TB_USER_MASTER TUM ON TRM.USER_ID  = TUM.USER_ID
      WHERE 1=1
      AND TRM.REVIEW_ID = ?`,[id], function(err, rows: any[], fields) {

      const data = rows[0];

      let template = pug.compileFile("views/components/card.pug");
      res.send(template({ data }));
      });
    } catch (e) {
      console.log(e);
    }
  });
});

app.get("/tagdetail", (req, res) => {
  try{
    connection.query(
      "SELECT TAG_ID as tagId, TAG_NAME as tagName, 'main' as type FROM TB_TAG_MASTER", function(err, rows: any[], fields) {
        let template = pug.compileFile("views/components/tag-select.pug");      
        res.send(template({ tags: rows }));
    });
  }catch (e){
    console.log(e);
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});