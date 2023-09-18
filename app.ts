import express from "express";
import pug from "pug";
import mysql from "mysql"; // mysql 모듈을 불러옵니다.
import mybatisMapprer from "mybatis-mapper";
import bodyParser from "body-parser";
// var bodyParser = require('body-parser');
const app = express();
const port: number = 3000;

const mockUserId: string = "00002";

// 커넥션을 정의합니다.
// RDS Console 에서 본인이 설정한 값을 입력해주세요.
const connection = mysql.createConnection({
  host: "keung-rds.colgpa78bwcs.ap-northeast-2.rds.amazonaws.com",
  user: "admin",
  password: "!Dkagh00",
  database: "keung",
});
mybatisMapprer.createMapper(["src/sql/mapper.xml"]);

app.set("view engine", "pug");
app.use(express.static("public"));
app.use(express.static("src"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  app.locals.userId = mockUserId;
  res.render("index");
});

app.get("/add-review", (req, res) => {
  res.render("add-review");
});

app.get("/user", (req, res) => {
  const userId = app.locals.userId;
  const query = mybatisMapprer.getStatement(
    "app",
    "user",
    { userId },
    { language: "sql", indent: "  " }
  );
  connection.connect(function () {
    try {
      connection.query(query, function (err, rows: any[], fields) {
        res.send(rows[0].NAME + "님! 어떤 식당을 찾으시나요?");
      });
    } catch (e) {
      console.log(e);
    }
  });
});

app.get("/reviews", (req, res) => {
  app.locals.tagIds = new Set();
  const query = mybatisMapprer.getStatement(
    "app",
    "reviews",
    {},
    { language: "sql", indent: "  " }
  );
  connection.connect(function () {
    try {
      connection.query(query, function (err, rows: any[], fields) {
        let template = pug.compileFile("views/components/card-layout.pug");
        res.send(template({ datas: rows }));
      });
    } catch (e) {
      console.log(e);
    }
  });
});

app.get("/reviews/:tagId", (req, res) => {
  const { tagId } = req.params;
  const tagIds: Set<string> = app.locals.tagIds;

  tagIds.has(tagId) ? tagIds.delete(tagId) : tagIds.add(tagId);

  const sqlId = tagIds.size > 0 ? "reviews/tagId" : "reviews";

  const query = mybatisMapprer.getStatement(
    "app",
    sqlId,
    { tagIds: Array.from(tagIds) },
    { language: "sql", indent: "  " }
  );
  connection.connect(function () {
    try {
      connection.query(query, function (err, rows: any[], fields) {
        let template = pug.compileFile("views/components/card-layout.pug");
        res.send(template({ datas: rows }));
      });
    } catch (e) {
      console.log(e);
    }
  });
});

app.get("/review/:id", (req, res) => {
  const { id } = req.params;
  const query = mybatisMapprer.getStatement(
    "app",
    "review/id",
    { id },
    { language: "sql", indent: "  " }
  );
  connection.connect(function () {
    try {
      connection.query(query, function (err, rows: any[], fields) {
        const data = rows[0];

        let template = pug.compileFile("views/components/card.pug");
        res.send(template({ data }));
      });
    } catch (e) {
      console.log(e);
    }
  });
});

app.get("/review/tags/:id", (req, res) => {
  const userId = app.locals.userId;
  // console.log(userId);
  const { id } = req.params;
  const query = mybatisMapprer.getStatement(
    "app",
    "review/tags/id",
    { id, userId },
    { language: "sql", indent: "  " }
  );
  try {
    connection.query(query, function (err, rows: any[], fields) {
      let template = pug.compileFile("views/components/tag-select.pug");
      res.send(template({ tags: rows }));
    });
  } catch (e) {
    console.log(e);
  }
});

app.get("/tagdetail", (req, res) => {
  const query = mybatisMapprer.getStatement(
    "app",
    "tagdetail",
    {},
    { language: "sql", indent: "  " }
  );
  try {
    connection.query(query, function (err, rows: any[], fields) {
      let template = pug.compileFile("views/components/tag-select.pug");
      res.send(template({ tags: rows }));
    });
  } catch (e) {
    console.log(e);
  }
});

app.put("/like", (req, res) => {
  const userId = app.locals.userId;
  const { reviewId, tagId } = req.body;
  const query = mybatisMapprer.getStatement(
    "app",
    "like",
    { userId, reviewId, tagId },
    { language: "sql", indent: "  " }
  );
  try {
    connection.query(query, function (err, rows: any[], fields) {
      res.send();
    });
  } catch (e) {
    console.log(e);
  }
});

app.delete("/unlike", (req, res) => {
  const userId = app.locals.userId;
  const { reviewId, tagId } = req.body;
  const query = mybatisMapprer.getStatement(
    "app",
    "unlike",
    { userId, reviewId, tagId },
    { language: "sql", indent: "  " }
  );
  try {
    connection.query(query, function (err, rows: any[], fields) {
      res.send();
    });
  } catch (e) {
    console.log(e);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
