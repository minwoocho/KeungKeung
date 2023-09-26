import express, { NextFunction, Request, Response } from "express";
import mysql, { RowDataPacket, FieldPacket, ResultSetHeader } from "mysql2/promise"; // mysql 모듈을 불러옵니다.
import mybatisMapprer, { Params } from "mybatis-mapper";
import bodyParser from "body-parser";
import multer from "multer";

require("dotenv").config();

const app = express();
app.set("view engine", "pug");

const port = 3000;
const logging: false | "debug" | "info" | "error" = false;

const mockUserId = "00002";

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("에러 발생:", err);
  res.status(500).send("서버 에러 발생");
  next(err);
};

app.use(errorHandler);
app.use(express.static("public"));
app.use(express.static("src"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multer({ storage: multer.memoryStorage() }).array("img"));

const start = async () => {
  // 커넥션을 정의합니다.
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  const select = (sql: string, val?: string) => {
    logging && console.log(sql);
    return connection.query(sql, val) as Promise<[RowDataPacket[], FieldPacket[]]>;
  };

  const insert = (sql: string, val?: string) => {
    logging && console.log(sql);
    return connection.query(sql, val) as Promise<[ResultSetHeader, FieldPacket[]]>;
  };

  const remove = (sql: string, val?: string) => {
    logging && console.log(sql);
    return connection.query(sql, val) as Promise<[ResultSetHeader, FieldPacket[]]>;
  };

  // 마이바티스 매퍼 정의
  mybatisMapprer.createMapper(["src/sql/mapper.xml"]);

  const bindSQL = (id: string, param?: Params) =>
    mybatisMapprer.getStatement("app", id, param, {
      language: "sql",
      indent: "  ",
    });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`*===============================*`);
    console.log(`==         Keung Keung         ==`);
    console.log(`*===============================*`);
    console.log(process.env.TESTTT);
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

  app.get("/main/user", async (req, res) => {
    const userId = app.locals.userId;
    const sql = bindSQL("main/user", { userId });
    const [rows, fields] = await select(sql);
    res.send(rows[0].name + "님! 어떤 식당을 찾으시나요?");
  });

  app.get("/main/tags", async (req, res) => {
    const sql = bindSQL("main/tags");
    const [rows, fields] = await select(sql);
    res.render("components/tag-select", { tags: rows });
  });

  app.get("/main/cards", async (req, res) => {
    const sql = bindSQL("main/cards");
    const [rows, fields] = await select(sql);
    res.render("components/card-layout", { datas: rows });
  });

  app.get("/cards/:tagId", async (req, res) => {
    const { tagId } = req.params;
    const tagIds: Set<string> = app.locals.tagIds;

    tagIds.has(tagId) ? tagIds.delete(tagId) : tagIds.add(tagId);

    const sqlId = tagIds.size > 0 ? "main/cards/tagId" : "main/cards";

    const sql = bindSQL(sqlId, { tagIds: Array.from(tagIds) });
    const [rows, fields] = await select(sql);
    res.render("components/card-layout", { datas: rows });
  });

  app.get("/card/:id", async (req, res) => {
    const { id } = req.params;
    const sql = bindSQL("card/id", { id });
    const [rows, fields] = await select(sql);
    res.render("components/card", { data: rows[0] });
  });

  app.get("/card/images/:id", async (req, res) => {
    const { id } = req.params;
    const sql = bindSQL("card/images/id", { id });
    const [rows, fields] = await select(sql);

    if (rows.length === 0) {
      console.error("Image not found");
      res.status(404).send("Image not found");
      return;
    }
    const imageBuffer = rows[0].imageData;
    res.writeHead(200, {
      "Content-Type": "image/jpeg", // 이미지 형식에 따라 변경
      "Content-Length": imageBuffer.length,
    });
    res.end(imageBuffer);
  });

  app.get("/card/tags/:id", async (req, res) => {
    const userId = app.locals.userId;
    const { id } = req.params;
    const sql = bindSQL("card/tags/id", { id, userId });
    const [rows, fields] = await select(sql);
    res.render("components/tag-select", { tags: rows });
  });

  app.put("/like", async (req, res) => {
    const userId = app.locals.userId;
    const { reviewId, tagId } = req.body;
    const sql = bindSQL("like", { userId, reviewId, tagId });
    const [result] = await insert(sql);
    res.send();
  });

  app.delete("/unlike", async (req, res) => {
    const userId = app.locals.userId;
    const { reviewId, tagId } = req.body;
    const sql = bindSQL("unlike", { userId, reviewId, tagId });
    const [result] = await remove(sql);
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

  app.get("/add/tagList", async (req, res) => {
    const sql = bindSQL("add/tagList");
    const [rows, fields] = await select(sql);
    res.render("components/tag-select", { tags: rows });
  });

  app.post("/add/review", async (req, res, next) => {
    const userId = app.locals.userId;
    const { storeName, tagIds, reviewContent } = req.body;
    const files = req.files as Express.Multer.File[];
    const images = files.map((item) => item.buffer.toString("base64"));

    console.log("==================inserted data==================");
    console.log(JSON.stringify(req.body));
    console.log("==================inserted data==================");

    if (!userId) {
      res.send("세션정보가 없습니다.");
      console.log("session expired");
      return;
    }

    await connection.beginTransaction();

    try {
      const sql1 = bindSQL("add/review/store", { storeName });
      const [result1] = await insert(sql1);
      const storeId = result1.insertId;

      const sql2 = bindSQL("add/review", { storeId, userId, reviewContent });
      const [result2] = await insert(sql2);
      const reviewId = result2.insertId;

      const sql3 = bindSQL("add/review/tag", { reviewId, tagIds: tagIds.split(",") });

      const insertImages = images.map((image, index) => {
        const sql4 = bindSQL("add/review/image", { reviewId, index, image });
        return insert(sql4);
      });

      await Promise.all([insert(sql3), ...insertImages]);

      connection.commit();
    } catch (e) {
      connection.rollback();
      next(e);
    } finally {
      connection.end();
    }

    res.send();
  });
};
start();
