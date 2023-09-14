const express = require("express");
const pug = require("pug");
const app = express();
const port = 3000;

app.set("view engine", "pug");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/test", (req, res) => {
  let template = pug.compileFile("views/pages/test.pug");
  console.log(template());
  res.send(template());
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
