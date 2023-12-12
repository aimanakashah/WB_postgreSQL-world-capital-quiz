import express from "express"; //a framework for building web application using node.js
import bodyParser from "body-parser"; //import so that we can use the static files, public, css, image
import pg from "pg"; //pg for postgresql

const app = express();
const port = 3000;

const db = new pg.Client({
  //all details to before connecting to the database
  user: "postgres",
  host: "localhost",
  database: "World", //database that we want to access
  password: "1234567890", //password u set up in pgAdmin4
  port: 5432, //default port used in pgAdmin
});

db.connect(); //connecting to the database

let quiz = [
  //part of the data we want to access, provide here for early load.
  { country: "France", capital: "Paris" },
  { country: "United Kingdom", capital: "London" },
  { country: "United States of America", capital: "New York" },
];

//code snippet to read to the database
db.query("SELECT * FROM capitals", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    quiz = res.rows; //setting the data from query to the default quiz above.
  }
  db.end(); //closing off our connection once all have been load up
});

let totalCorrect = 0; //setting the default data to 0

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {}; //the question will eventually assign to when we hit up the random in nextQuestion()

// GET home page
app.get("/", async (req, res) => {
  //load up the page
  totalCorrect = 0;
  await nextQuestion(); //calling for the function nextquestion
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion }); //render the current question to index.ejs
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim(); //.trim() method of JS to remove the spaces, tabs infront and trailing of the string. will ignore the spaces between two words.
  let isCorrect = false; //to pass data to ejs later
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    //checking the answer, both was set to lowercase to avoid confusion if user submit capital case since it has different value.

    totalCorrect++; //added the score points
    console.log(totalCorrect);
    isCorrect = true; //assigning to true to pass data in ejs.
  }

  nextQuestion(); //calling for the next question once we get the right answer
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)]; //hit the random country from data we gain from the database

  currentQuestion = randomCountry; //assigning and overwrite new object to the current question object
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
