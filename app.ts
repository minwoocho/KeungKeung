import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import mysql, { RowDataPacket, FieldPacket, ResultSetHeader } from "mysql2/promise"; // mysql 모듈을 불러옵니다.
import * as expressSession from "express-session";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import mybatisMapprer, { Params } from "mybatis-mapper";
import bodyParser from "body-parser";
import multer from "multer";

declare module "express-session" {
  export interface SessionData {
    is_logined?: boolean;
    dispayName?: string;
    userId?: string;
  }
}

const options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: 3306,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const mysqlstore = MySQLStore(expressSession);
const sessionStore = new mysqlstore(options);

const app = express();

app.use(
  session({
    secret: "asdfasffdas",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  }),
);

const port = process.env.PORT_NUMBER;

const mockUserId = "00002";

// # logging level
// # debug: 3
// # info: 2
// # error: 1
// # none: 0
const loggingLevel = Number.parseInt(process.env.LOGGING_LEVEL || "0");

const sessionHandler = (req: Request, res: Response, next: NextFunction) => {
  loggingLevel >= 3 && console.log(req.session);
  req.session.resetMaxAge();
  next();
};

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error("errorHandler Executed!");
  loggingLevel >= 1 && console.error("에러 발생: ", err);
  res.status(500).send({ message: "서버 에러 발생" });
  next(err);
}

app.set("view engine", "pug");

app.use(express.static("public"));
app.use(express.static("src"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multer({ storage: multer.memoryStorage() }).array("img"));

app.use(sessionHandler);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 35,
});

const getConnection = async () => {
  console.log("Connection Connected!");
  const connection = await pool.getConnection();

  return {
    connection,
    [Symbol.asyncDispose]: async () => {
      console.log("Connection Released!");
      connection.release();
    },
  };
};

const start = async () => {
  // 마이바티스 매퍼 정의
  mybatisMapprer.createMapper(["src/sql/mapper.xml"]);

  const bindSQL = (id: string, param?: Params) => {
    loggingLevel >= 2 && console.log(id, JSON.stringify(param));
    return mybatisMapprer.getStatement("app", id, param, {
      language: "sql",
      indent: "  ",
    });
  };

  const { connection } = await getConnection();

  const select = (sql: string, val?: string) => {
    loggingLevel >= 3 && console.log(sql);
    return connection.execute(sql, val) as Promise<[RowDataPacket[], FieldPacket[]]>;
  };

  const insert = (sql: string, val?: any) => {
    loggingLevel >= 3 && console.log(sql);
    return connection.execute(sql, val) as Promise<[ResultSetHeader, FieldPacket[]]>;
  };

  const remove = (sql: string, val?: string) => {
    loggingLevel >= 3 && console.log(sql);
    return connection.execute(sql, val) as Promise<[ResultSetHeader, FieldPacket[]]>;
  };

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Logging level: ${loggingLevel}`);
    console.log(`*===============================*`);
    console.log(`==         Keung Keung         ==`);
    console.log(`*===============================*`);
    console.log(
      " __  __                                          __  __                                         ",
    );
    console.log(
      "/\\ \\/\\ \\                                        /\\ \\/\\ \\                                        ",
    );
    console.log(
      "\\ \\ \\/'/'      __    __  __    ___       __     \\ \\ \\/'/'      __    __  __    ___       __     ",
    );
    console.log(
      " \\ \\ , <     /'__`\\ /\\ \\/\\ \\ /' _ `\\   /'_ `\\    \\ \\ , <     /'__`\\ /\\ \\/\\ \\ /' _ `\\   /'_ `\\   ",
    );
    console.log(
      "  \\ \\ \\\\`\\  /\\  __/ \\ \\ \\_\\ \\/\\ \\/\\ \\ /\\ \\L\\ \\    \\ \\ \\\\`\\  /\\  __/ \\ \\ \\_\\ \\/\\ \\/\\ \\ /\\ \\L\\ \\  ",
    );
    console.log(
      "   \\ \\_\\ \\_\\\\ \\____\\ \\ \\____/\\ \\_\\ \\_\\\\ \\____ \\    \\ \\_\\ \\_\\\\ \\____\\ \\ \\____/\\ \\_\\ \\_\\\\ \\____ \\ ",
    );
    console.log(
      "    \\/_/\\/_/ \\/____/  \\/___/  \\/_/\\/_/ \\/___L\\ \\    \\/_/\\/_/ \\/____/  \\/___/  \\/_/\\/_/ \\/___L\\ \\",
    );
    console.log(
      "                                         /\\____/                                         /\\____/",
    );
    console.log(
      "                                         \\_/__/                                          \\_/__/ ",
    );
  });

  /**
   * 메인페이지
   */
  app.post("/login", async (req, res) => {
    // const { userId } = req.body;
    const userId = mockUserId;

    const sql = bindSQL("main/user", { userId });
    const [rows, fields] = await select(sql);

    req.session.userId = userId;
    req.session.dispayName = rows[0].name;
    req.session.is_logined = true;

    loggingLevel >= 2 && console.log("login User : " + req.session.userId);
    res.render("index");
  });

  app.get("/", (req, res) => {
    res.render("index");
  });

  app.get("/main/user", async (req, res) => {
    if (!req.session.is_logined)
      res.send("<div hx-post='/login' hx-target='body'>로그인 해 주세용~~~</div>");
    else res.send(req.session.dispayName + "님! 어떤 식당을 찾으시나요?");
  });

  app.get("/main/tags", async (req, res) => {
    const sql = bindSQL("main/tags");
    const [rows, fields] = await select(sql);
    res.render("components/tag-select", { tags: rows });
  });

  app.post("/main/cards", async (req, res) => {
    const { tagId } = req.body;
    const tagIds: string[] = tagId ? Array.from(tagId) : [];

    const sql = bindSQL("main/cards", { tagIds });
    const [rows, fields] = await select(sql);
    res.render("components/card-layout", { datas: rows });
  });

  app.get("/card/:id", async (req, res) => {
    const { id } = req.params;
    const sql = bindSQL("card/id", { id });
    const [rows, fields] = await select(sql);
    res.render("components/card", { data: rows[0] });
  });

  app.get("/card/images/:id/:seq", async (req, res) => {
    const { id, seq } = req.params;
    const sql = bindSQL("card/images/id", { id, seq });
    const [rows, fields] = await select(sql);

    if (rows.length === 0) {
      loggingLevel >= 1 && console.error("Image not found");
      res.status(404).send("Image not found");
      return;
    }

    const imageBuffer = rows[0].imageData;
    res.writeHead(200, {
      "Content-Type": rows[0].mimetype,
      "Content-Length": imageBuffer.length,
    });
    res.end(imageBuffer);
  });

  app.get("/card/tags/:id", async (req, res) => {
    const userId = req.session.userId || "";
    const { id } = req.params;
    const sql = bindSQL("card/tags/id", { id, userId });
    const [rows, fields] = await select(sql);
    res.render("components/tag-select", { tags: rows });
  });

  app.put("/like", async (req, res) => {
    if (!req.session.is_logined) res.send();
    const userId = req.session.userId || "";
    const { reviewId, tagId } = req.body;
    const sql = bindSQL("like", { userId, reviewId, tagId });
    const [result] = await insert(sql);
    res.send();
  });

  app.delete("/unlike", async (req, res) => {
    if (!req.session.is_logined) res.send();
    const userId = req.session.userId || "";
    const { reviewId, tagId } = req.body;
    const sql = bindSQL("unlike", { userId, reviewId, tagId });
    const [result] = await remove(sql);
    res.send();
  });

  /**
   * 리뷰등록 페이지
   */
  app.get("/add-review", (req, res) => {
    res.render("add-review");
  });

  app.get("/add/tagList", async (req, res, next) => {
    const sql = bindSQL("add/tagList");
    const [rows, fields] = await select(sql);
    res.render("components/tag-select", { tags: rows });
  });

  app.post("/add/review", async (req, res, next) => {
    if (!req.session.is_logined) res.send();
    const userId = req.session.userId;
    // const userId = mockUserId;
    const { storeName, tagIds, reviewContent } = req.body;
    const files = req.files as Express.Multer.File[];

    loggingLevel >= 2 && console.log("==================inserted data==================");
    loggingLevel >= 2 && console.log(JSON.stringify(req.body));
    loggingLevel >= 2 && console.log(files);
    loggingLevel >= 2 && console.log("==================inserted data==================");

    try {
      if (!userId) throw new Error("세션정보가 없습니다.");

      await connection.beginTransaction();

      const sql1 = bindSQL("add/review/store", { storeName });
      const [result1] = await insert(sql1);
      const storeId = result1.insertId;

      const sql2 = bindSQL("add/review", { storeId, userId, reviewContent });
      const [result2] = await insert(sql2);
      const reviewId = result2.insertId;

      const sql3 = bindSQL("add/review/tag", { reviewId, tagIds: tagIds.split(",") });

      const insertImages = files.map((file, index) => {
        const image = file.buffer;
        const mimetype = file.mimetype;
        const originalname = file.originalname;
        const sql4 = bindSQL("add/review/image", {
          reviewId,
          index,
          mimetype,
          originalname,
        });
        return insert(sql4, [image]);
      });

      await insert(sql3);

      await Promise.all([...insertImages]);

      connection.commit();
      res.end();
    } catch (e) {
      console.log(next);
      connection.rollback();
      next(e);
    }
  });
};

start();
