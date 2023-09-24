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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
  app.locals.userId = mockUserId;
  app.locals.tagIds = new Set();
  console.log("login User : " + app.locals.userId);
  res.render("index");
});

app.get("/main/user", (req, res) => {
  const userId = app.locals.userId;
  const query = mybatisMapprer.getStatement(
    "app",
    "main/user",
    { userId },
    { language: "sql", indent: "  " }
  );
  connection.query(query, function (err: mysql.MysqlError, rows: any[]) {
    res.send(rows[0].NAME + "님! 어떤 식당을 찾으시나요?");
  });
});

app.get("/main/tags", (req, res) => {
  const query = mybatisMapprer.getStatement(
    "app",
    "main/tags",
    {},
    { language: "sql", indent: "  " }
  );
  connection.query(query, function (err: mysql.MysqlError, rows: any[]) {
    res.render("components/tag-select", { tags: rows });
  });
});

app.get("/main/cards", (req, res) => {
  const query = mybatisMapprer.getStatement(
    "app",
    "main/cards",
    {},
    { language: "sql", indent: "  " }
  );
  connection.query(query, function (err: mysql.MysqlError, rows: any[]) {
    res.render("components/card-layout", { datas: rows });
  });
});

app.get("/cards/:tagId", (req, res) => {
  const { tagId } = req.params;
  const tagIds: Set<string> = app.locals.tagIds;

  tagIds.has(tagId) ? tagIds.delete(tagId) : tagIds.add(tagId);

  const sqlId = tagIds.size > 0 ? "main/cards/tagId" : "main/cards";

  const query = mybatisMapprer.getStatement(
    "app",
    sqlId,
    { tagIds: Array.from(tagIds) },
    { language: "sql", indent: "  " }
  );
  connection.query(query, function (err: mysql.MysqlError, rows: any[]) {
    res.render("components/card-layout", { datas: rows });
  });
});

app.get("/card/:id", (req, res) => {
  const { id } = req.params;
  const query = mybatisMapprer.getStatement(
    "app",
    "card/id",
    { id },
    { language: "sql", indent: "  " }
  );
  connection.query(query, function (err: mysql.MysqlError, rows: any[]) {
    res.render("components/card", { data: rows[0] });
  });
});

app.get("/card/tags/:id", (req, res) => {
  const userId = app.locals.userId;
  const { id } = req.params;
  const query = mybatisMapprer.getStatement(
    "app",
    "card/tags/id",
    { id, userId },
    { language: "sql", indent: "  " }
  );
  connection.query(query, function (err: mysql.MysqlError, rows: any[]) {
    res.render("components/tag-select", { tags: rows });
  });
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
  connection.query(query);
  res.send();
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
  connection.query(query);
  res.send();
});

app.get("/add-review", (req, res) => {
  app.locals.addTagIds = new Set();
  res.render("add-review");
});

app.get("/add/tagList", (req, res) => {
  const query = mybatisMapprer.getStatement(
    "app",
    "add/tagList",
    {},
    { language: "sql", indent: "  " }
  );
  connection.query(query, function (err: mysql.MysqlError, rows: any[]) {
    res.render("components/tag-select", { tags: rows });
  });
});

app.post("/add/review", (req, res) => {
  const userId = app.locals.userId;
  if (!userId) {
    res.send("세션정보가 없습니다.");
  }
  const { storeName, tagIds, reviewContent } = req.body;
  const query = mybatisMapprer.getStatement(
    "app",
    "add/review/store",
    { storeName },
    { language: "sql", indent: "  " }
  );
  connection.beginTransaction(function () {
    try {
      connection.query(query, function (err: mysql.MysqlError, rows: any) {
        const storeId = rows.insertId;
        const query2 = mybatisMapprer.getStatement(
          "app",
          "add/review",
          { storeId, userId, reviewContent },
          { language: "sql", indent: "  " }
        );
        connection.query(query2, function (err: mysql.MysqlError, rows: any) {
          const reviewId = rows.insertId;
          const query3 = mybatisMapprer.getStatement(
            "app",
            "add/review/tag",
            { reviewId, tagIds: tagIds.split(",") },
            { language: "sql", indent: "  " }
          );
          connection.query(query3, () => {
            // connection.commit();
            console.log("rollback for btn test.");
            console.log(
              "inserted data",
              "\nstoreName : " + storeName,
              "\nstoreId : " + storeId,
              "\nuserId : " + userId,
              "\nreviewContent : " + reviewContent,
              "\nreviewId : " + reviewId,
              "\ntagIds : " + tagIds.split(",").toString()
            );
            connection.rollback();
          });
        });
      });
    } catch (e) {
      console.log(e);
      connection.rollback();
    }
  });
  res.send(true);
});
