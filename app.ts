import express from "express";
import mysql, { MysqlError } from "mysql"; // mysql 모듈을 불러옵니다.
import mybatisMapprer from "mybatis-mapper";
import bodyParser from "body-parser";
import multer from "multer";

const app = express();
const port = 3000;

const mockUserId = "00002";

// 커넥션을 정의합니다.
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
app.use(multer({ storage: multer.memoryStorage() }).array("img"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`*===============================*`);
  console.log(`==         Keung Keung         ==`);
  console.log(`*===============================*`);
});

/**
 * 메인페이지
 */
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
  connection.query(query, (err: MysqlError, rows: any) => {
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
  connection.query(query, (err: MysqlError, rows: any) => {
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
  connection.query(query, (err: MysqlError, rows: any) => {
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
  connection.query(query, (err: MysqlError, rows: any) => {
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
  connection.query(query, (err: MysqlError, rows: any) => {
    res.render("components/card", { data: rows[0] });
  });
});

app.get("/card/images/:id", (req, res) => {
  const { id } = req.params;
  const query = mybatisMapprer.getStatement(
    "app",
    "card/images/id",
    { id },
    { language: "sql", indent: "  " }
  );
  connection.query(query, (err: MysqlError, rows: any) => {
    if (rows.length === 0) {
      console.error("Image not found");
      res.status(404).send("Image not found");
      return;
    }
    const imageBuffer = rows[0].imageData;
    console.log(imageBuffer);
    res.writeHead(200, {
      "Content-Type": "image/jpeg", // 이미지 형식에 따라 변경
      "Content-Length": imageBuffer.length,
    });
    res.end(imageBuffer);
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
  connection.query(query, (err: MysqlError, rows: any) => {
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

/**
 * 리뷰등록 페이지
 */
app.get("/add-review", (req, res) => {
  app.locals.userId = mockUserId;
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
  connection.query(query, (err: MysqlError, rows: any) => {
    res.render("components/tag-select", { tags: rows });
  });
});

app.post("/add/review", async (req, res) => {
  const userId = app.locals.userId;
  const { storeName, tagIds, reviewContent } = req.body;
  const files = req.files as Express.Multer.File[];
  const images = files.map((item) => item.buffer.toString("base64"));

  console.log("==================inserted data==================");
  // console.log(images);
  console.log(JSON.stringify(req.body));
  console.log("==================inserted data==================");

  if (!userId) {
    res.send("세션정보가 없습니다.");
    console.log("session expired");
    return;
  }

  connection.beginTransaction(() => {
    const query1 = mybatisMapprer.getStatement(
      "app",
      "add/review/store",
      { storeName },
      { language: "sql", indent: "  " }
    );
    connection.query(query1, (err: MysqlError, rows: any) => {
      const storeId = rows.insertId;
      const query2 = mybatisMapprer.getStatement(
        "app",
        "add/review",
        { storeId, userId, reviewContent },
        { language: "sql", indent: "  " }
      );
      connection.query(query2, (err: MysqlError, rows: any) => {
        const reviewId = rows.insertId;
        const query3 = mybatisMapprer.getStatement(
          "app",
          "add/review/tag",
          { reviewId, tagIds: tagIds.split(",") },
          { language: "sql", indent: "  " }
        );
        connection.query(query3, (err, rows) => {
          // connection.commit();
          // console.log("rollback for btn test.---------------------");
          // connection.rollback();
          // res.send(true);
        });
        images.forEach((image, index) => {
          const query4 = mybatisMapprer.getStatement(
            "app",
            "add/review/image",
            { reviewId, index, image },
            { language: "sql", indent: "  " }
          );
          connection.query(query4, (err, rows) => {
            connection.commit();
            // console.log("rollback for btn test.---------------------");
            // connection.rollback();
            // res.send(true);
          });
        });
      });
    });
  });
  res.send();
});
