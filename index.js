const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();


app.use(cors({
    origin: ['http://localhost:5173', 'https://upraised-quiz-pi.vercel.app'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


const formatQuestions = (questions) => {
    return questions.map((question) => {
        return {
            question: question.question,
            options: question.incorrect_answers.concat(question.correct_answer).sort()
        };
    });
}


app.get("/questions", (req, res) => {
  fetch(`https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple&category=19`)
  .then(response => response.json())
  .then(data => {
    res.cookie('user-session', JSON.stringify({
        questions: data.results,
        answers: []
    }), {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: 'None', 
        path: '/',
        domain: 'localhost'
    });
    res.send(formatQuestions(data.results ?? []));
  });
});

app.post('/question/:id/answer', (req, res) => {
    const { id } = req.params;
    const { answer } = req.body;
    const parsedCookie = JSON.parse(req.cookies['user-session']);
    if(parsedCookie && parsedCookie.answers){
        parsedCookie.answers[id - 1] = answer
    }
    res.cookie('user-session', JSON.stringify(parsedCookie), {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: 'None',
        path: '/'
    });
    res.send('Answer saved')
})

app.post('/submit', (req, res) => {
    const parsedCookie = JSON.parse(req.cookies['user-session']);
    console.log(req.cookies['user-session'])
    const scoreBoard = {
        totalScore: 0,
        correct: 0,
        incorrect: 0
    }
    parsedCookie.questions.forEach((question, index) => {
        if(parsedCookie.answers[index].includes(question.correct_answer)){
            scoreBoard.correct += 1;
        }
        else {
            scoreBoard.incorrect += 1;
        }
    })
    scoreBoard.totalScore =( scoreBoard.correct / parsedCookie.questions.length) * 100;
    res.send(scoreBoard)
})

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
