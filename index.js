import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "books",
  password: "postgresql#",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const API_URL = "https://openlibrary.org/search/authors.json?q=";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let writers = [];

app.get("/showreadwish/:id", async (req, res) => {
  try {
    console.log("type is " + req.params.id);
    const result = await db.query("SELECT * from booklist WHERE type = $1",[req.params.id]);
    let list = result.rows;
    res.render("showread.ejs", {items: list, type: req.params.id, error: ""});
  } catch (err) {
    let list = [];
    res.render("showread.ejs", {items: list, type: req.params.id, error: "Sorry - There are no items to display"});
  }
});

app.get("/edit/:id&:type", async (req, res) => {
  try {
    const result = await db.query("SELECT * from booklist WHERE id = $1",[req.params.id]);
    let list = result.rows;
    res.render("editnotes.ejs", {items: list});
  } catch (err) {
    const result2 = await db.query("SELECT * from booklist WHERE type = $1",[req.params.type]);
    let list = result2.rows;
    res.render("showread.ejs", {items: list, type: req.params.type, error: ""});
  }
});

app.get("/delete/:id&:type", async (req, res) => {
  try {
    const result = await db.query("DELETE FROM booklist WHERE id = $1",[req.params.id]);
    const result2 = await db.query("SELECT * from booklist WHERE type = $1",[req.params.type]);
    let list = result2.rows;
    res.render("showread.ejs", {items: list, type: type, error: ""});
  } catch (err) {
    const result3 = await db.query("SELECT * from booklist WHERE type = $1",[req.params.type]);
    let list = result3.rows;
    res.render("showread.ejs", {items: list, type: req.params.type, error: "Sorry - Your entry was not deleted"});
  }
});

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT writer FROM books ORDER BY id ASC");
    writers = result.rows;
    res.render("index.ejs", {items: writers});
  } catch (err) {
    console.log(err);
  }
});

app.get("/deadoralive", async (req, res) => {
  try {
    const result1 = await db.query("SELECT alive FROM books WHERE alive = $1",["a"]);
    const result2 = await db.query("SELECT * FROM BOOKS");
    const total = result2.rows.length;
    const alive = result1.rows.length;
    // let alive = 0;
    // for (var i=0;i<count;i++) {
    //   if (result.rows.alive == "a") {
    //     alive +=1;
    //   }
    // }
    let dead = total - alive;
    console.log("alive " + alive + " dead " + dead);
    res.render("deadoralive.ejs", {alive: alive, dead: dead});
  } catch (err) {
    console.log(err);
  }
});

app.get("/updatecountrylist", async (req, res) => {
  try {
    const result = await db.query("SELECT country FROM books ORDER BY country ASC");
    const count = result.rows.length;
    let countryArray = [];
    for (var i=0;i<count;i++) {
      if (!countryArray.some((c) => result.rows[i].country.includes(c))) {
          countryArray.push(result.rows[i].country);
      }
    }
    let countryCount = countryArray.length;
    let writerCount = [];
    
    for (var i=0;i<countryCount;i++) {
      let counter = 0;
      writerCount.push(counter);
      for (var j=0;j<count;j++) {
          if (countryArray[i] == result.rows[j].country) {
            counter += 1;
            writerCount[i] = counter;
          }
      }
    }

    // for (var i=0;i<countryCount;i++) {
    //   //const result = await db.query("UPDATE countrylist SET country = $1, writer = $2",[countryArray[i],writerCount[i]]);
    //   const result = await db.query("INSERT INTO countrylist (country,writer) VALUES ($1,$2)",[countryArray[i],writerCount[i]]);
    // }

    const result2 = await db.query("SELECT * FROM countrylist ORDER BY writer DESC");
    let list = result2.rows;
    //console.log("list is " + res.json(list));
    res.render("showcountry.ejs", {items: list, count: countryCount, error: ""});

  } catch (err) {
    const result3 = await db.query("SELECT * FROM countrylist ORDER BY writer DESC");
    let list = result3.rows;
    res.render("showcountry.ejs", {items: list,  count: countryCount, error: "Sorry - Problem with update"});
  }
});

app.get("/getwriter/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}${req.params.id}`);
    let keyIn = response.data.docs[0].key;
    const result = await axios.get(`https://openlibrary.org/authors/${keyIn}/works.json`);
    const titleArray = [];
    const arr =[];

    Object.keys(result.data).forEach(function(key) {
      arr.push(key, result.data[key]);
    });

    for (var i=0;i<arr[5].length;i++) {
      titleArray.push(arr[5][i].title);
    }
    
    let items = {writer: req.params.id, count: titleArray.length, key: keyIn, items: titleArray, error: ""};
    res.render("showworks.ejs", items);

  } catch (error) {
    let items = {writer: req.params.id, count: titleArray.length, key: keyIn, items: titleArray, error: "Sorry No Listings Found"};
    res.render("showworks.ejs", items);
  }
});

app.post("/unknown", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}${req.body.writer}`);
    let keyIn = response.data.docs[0].key;
    const result = await axios.get(`https://openlibrary.org/authors/${keyIn}/works.json`);
    const titleArray = [];
    const arr =[];
    Object.keys(result.data).forEach(function(key) {
      arr.push(key, result.data[key]);
    });
    for (var i=0;i<arr[5].length;i++) {
      titleArray.push(arr[5][i].title);
    }
    let items = {writer: req.params.id, count: titleArray.length, key: keyIn, items: titleArray, error: ""};
    res.render("showworks.ejs", items);

  } catch (error) {
    let items = {writer: req.body.writer, count: 1, key: "None", items: [], error: "Sorry No Listings Found"};
    res.render("showworks.ejs", items);
  }
});

app.post("/dbadd", async (req, res) => {
  try {
    const result = await db.query("INSERT INTO booklist (writer,title,wkey,type) VALUES ($1,$2,$3,$4)",[req.body.writer,req.body.title,req.body.key,req.body.type]);
    const result2 = await db.query("SELECT * from booklist WHERE type = $1",[req.body.type]);
    let typearr = result2.rows;
    let items = {items: typearr, type: req.body.type , error: ""};
    res.render("showread.ejs", items);
  } catch (error) {
    const result2 = await db.query("SELECT * from booklist WHERE type = $1",[req.body.type]);
    let typearr = result2.rows;                                                                           
    let items = {items: typearr, type: req.body.type, error: "Sorry - Your item was not added to the database - try again"};
    res.render("showread.ejs", items);
  }
});

app.post("/doedit", async (req, res) => {
  try {
    const result = await db.query("UPDATE booklist SET notes = $1 WHERE id = $2",[req.body.notes,req.body.id]);
    const result2 = await db.query("SELECT * from booklist WHERE type = $1",[req.body.type]);
    let typearr = result2.rows;
    let items = {items: typearr, type: req.body.type , error: ""};
    res.render("showread.ejs", items);
  } catch (error) {
    const result2 = await db.query("SELECT * from booklist WHERE type = $1",[req.body.type]);
    let typearr = result2.rows;                                                                           
    let items = {items: typearr, type: req.body.type, error: "Sorry - Your item was not updated - try again"};
    res.render("showread.ejs", items);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});


