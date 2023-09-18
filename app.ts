import express from "express";
import pug from "pug";
import mysql from "mysql"; // mysql 모듈을 불러옵니다.
import mybatisMapprer from "mybatis-mapper";
const app = express();
const port: number = 3000;

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

const mockUserId: string = "00003";

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/add-review", (req, res) => {
  res.render("add-review");
});

app.get("/user", (req, res) => {
  const userId = mockUserId;
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
  const { id } = req.params;
  const query = mybatisMapprer.getStatement(
    "app",
    "review/tags/id",
    { id },
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
