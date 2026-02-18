import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;


const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "OpenShelf",
  password: "Saipraneeth@2006",
  port: 5432,
});
db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
 


app.get("/", async (req, res) => {

  try{
  const totalbooks = await db.query("SELECT COUNT(*) FROM books;")
  const totalCompletedBooks = await db.query("SELECT COUNT(*) FROM books WHERE reading_status = $1;", ['Completed']);
  const totalReadingBooks = await db.query("SELECT COUNT(*) FROM books WHERE reading_status = $1;", ['Currently Reading']);
  const avgRating = await db.query("SELECT COALESCE(ROUND(AVG(rating),1), 0) AS avg_rating FROM books;");
  // console.log(totalbooks.rows[0].count);
  const currentlyReading = await db.query("SELECT id, title, author_name,cover_id FROM books WHERE reading_status = $1 ORDER BY id DESC LIMIT $2;", ['Currently Reading', 4]);
  const recentlyAdded = await db.query("SELECT id, title,cover_id,TO_CHAR(date_added, 'YYYY-MM-DD') AS date_added FROM books ORDER BY id DESC LIMIT $1;", [5]);
  // console.log(recentlyAdded.rows);
  res.render("dashboard.ejs", {
    totalbooks: Number(totalbooks.rows[0].count),
    totalCompletedBooks: Number(totalCompletedBooks.rows[0].count),
    totalReadingBooks: Number(totalReadingBooks.rows[0].count),
    avgRating: Number(avgRating.rows[0].avg_rating),
    currentlyReading: currentlyReading.rows,
    recentlyAdded: recentlyAdded.rows,
    hasError: false
  });

  }catch(err){
    console.error("Dashboard error:", err);
    res.render("dashboard.ejs", {
    totalbooks: Number(0),
    totalCompletedBooks: Number(0),
    totalReadingBooks: Number(0),
    avgRating: Number(0),
    currentlyReading: [],
    recentlyAdded: [],
    errorMessage: "Dashboard failed to load"
    });
    
  }
});



app.get("/dashboard", (req, res) => {
  res.redirect("/");
});




app.get("/discover", async (req, res) => {
  const search = req.query.query;

  if (!search) {

    return res.render("discover", { books: null,  hasError: false, searchQuery: search });

  }
  // search = search.trim();
  try{

  const result = await axios.get("https://openlibrary.org/search.json",
    {
      params:{
        q: search,
        fields: "title,author_name,cover_i,first_publish_year,key",
        limit: 32,
      },
       timeout: 5000
  });
  // console.log(result.data.docs);
  res.render("discover" , {books : result.data.docs, hasError: false,  searchQuery: search });
  }catch(err){
    console.log(err);
    return res.render("discover", { books: [], hasError: true , errorMessage: "Failed to fetch books. Please try again." });

  }
});




app.post("/add-book", async (req, res) =>{
  const work_key = req.body.work_key;
  const author_name = req.body.author || "Unknown Author";
  const cover_id = req.body.cover_id || null;

  if (!work_key) {
    return res.redirect("/discover");
  }
  console.log(work_key);
  try{

    const existing = await db.query("SELECT id FROM books WHERE key = $1;", [work_key]);
    if (existing.rows.length > 0) {
      return res.redirect("/library");
    }
  
  const result  = await axios.get(`https://openlibrary.org${work_key}.json`);
  const bookDetails = result.data;

  let description = "";

  if (typeof bookDetails.description === "string") {
    description = bookDetails.description;
  }
  else if (typeof bookDetails.description === "object" && bookDetails.description !== null) {
    description = bookDetails.description.value;
  }
  else {
    description = "No description available";
  }
  // console.log(work_key);
  // console.log(description);

  await db.query("INSERT INTO books (title, author_name, description,cover_id,key, reading_status, rating, user_id) VALUES($1, $2 , $3 , $4, $5, $6, $7, $8);", 
    [bookDetails.title, author_name, description,cover_id, bookDetails.key, "Planned", 0,1]
  );
  res.redirect("/library");

  }catch(err){
    console.error("Add book error:", err);
    res.redirect("/discover");
  }

});



app.get("/library", async (req, res) => {
  const search = req.query.query;
  let booksDetails = [];
  // console.log(search);
  try{
  if(search && search.length>0){
    const result = await db.query("SELECT * FROM books WHERE title ILIKE $1 OR author_name ILIKE $2 ORDER BY id DESC;", [`%${search}%`, `%${search}%` ]);
     booksDetails = result.rows;
  }else{
    const result = await db.query("SELECT * FROM books ORDER BY id DESC; ");
     booksDetails = result.rows;
  }
  res.render("library" , {books : booksDetails, hasError: false,  searchQuery: search });
  }catch(err){
    console.error("Library load error:", err);

    res.render("library", {
      books: [],
      hasError: true,
      errorMessage: "Library failed to load"
    });

  }
});



app.get("/book/:id", async (req, res) =>{
  const id = parseInt(req.params.id);
  if(typeof input === "number"){
    return res.redirect("/library");
  }

  try{
  const result = await db.query("SELECT * FROM books WHERE id = $1;", [id]);
  const bookDetails = result.rows[0];
  if (!bookDetails) {
      return res.redirect("/library");
  }
  // console.log(bookDetails);
  const result1 = await db.query("SELECT notes.* FROM notes INNER JOIN books ON notes.book_id = books.id WHERE books.id = $1 ORDER BY notes.created_at DESC;", [id]);
  const notes = result1.rows;
  // console.log(notes);
  res.render("book-details", {book : bookDetails, notes: notes,hasError: false }); 
  }catch(err){
    console.error("book details  load error:", err);
    res.redirect("/library");
  }
});



app.post("/update-book", async (req, res) =>{
  const id = req.body.id;
  let reading_status = req.body.reading_status;
  let rating = req.body.rating;
  let review = req.body.review;
  try{
  // console.log(review);
    await db.query("UPDATE books SET reading_status = $1 , rating = $2 WHERE id = $3;", [reading_status, rating, id]);
  if(review && review.length > 0){
    await db.query("INSERT INTO notes (book_id, note) VALUES ($1, $2);", [id, review]);
  }
  res.redirect(`/book/${id}`);
  }catch(err){
    console.error("book update load error:", err);
    res.redirect("/library");
  }
});

app.post("/update-notes", async (req, res) =>{
  const id = req.body.id;
  const book_id = req.body.book_id;
  const note = req.body.note;
  try{

    await db.query("UPDATE notes SET note = $1 WHERE ID = $2;", [note, id]);
    res.redirect(`/book/${book_id}`);
  }catch(err){
    console.log("note-update error: ", err);
    res.redirect(`/book/${book_id}`);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
