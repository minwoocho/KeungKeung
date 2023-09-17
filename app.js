const express = require('express');
const pug = require('pug');
const fs = require('fs');
const app = express();
const port = 3000;

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.static('src'));

app.get('/', (req, res) => {
  const tagMockData = JSON.parse(fs.readFileSync('src/mock/tags.json', 'utf8'));
  const reviewMockData = JSON.parse(fs.readFileSync('src/mock/reviews.json', 'utf8'));
  res.render('index', { tags: tagMockData, reviews: reviewMockData });
});

app.post('/test', (req, res) => {
  let template = pug.compileFile('views/pages/test.pug');
  console.log(template());
  res.send(template());
});

app.get('/add-review', (req, res) => {
  let template = pug.compileFile('views/pages/add-review.pug');
  const tagMockData = JSON.parse(fs.readFileSync('src/mock/tags.json', 'utf8'));

  res.send(template({ tags: tagMockData }));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
