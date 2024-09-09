const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { encrypt, decrypt } = require("./utils");

const app = express();


app.use(cors({
    origin: ['http://localhost:5173', 'https://upraised-quiz-ten.vercel.app'],
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

app.get('/', (req, res) => {
    res.send('Hello from Express on Vercel!');
});

app.get("/questions", (req, res) => {
    const fetchQuestions = (retryCount = 0) => {
      fetch(`https://opentdb.com/api.php?amount=5&type=multiple&difficulty=easy`)
        .then(response => response.json())
        .then(data => {
          if (data.response_code === 5 && retryCount < 3) {
            console.log(`Retry attempt ${retryCount + 1}`);
            setTimeout(() => fetchQuestions(retryCount + 1), 5000);
          } else {
            const payload = JSON.stringify({
                questions: data.results ?? [],
                answers: []
            });
            const encryptedPayload = encrypt(payload);
            res.cookie('user-session', encryptedPayload, {
                maxAge: 24 * 60 * 60 * 1000,
                secure: true,
                httpOnly: true,
                sameSite: 'none',
            });
            res.send(formatQuestions(data.results ?? []));
          }
        })
        .catch(err => {
            console.log(err)
          res.status(500).send({ error: "Failed to fetch questions" });
        });
    };
    fetchQuestions();
});

app.post('/question/:id/answer', (req, res) => {
    const { id } = req.params;
    const { answer } = req.body;
    const parsedCookie = req.cookies['user-session'];
    const decryptedData = JSON.parse(decrypt(parsedCookie));
    if(decryptedData && decryptedData.answers){
        decryptedData.answers[id - 1] = answer
    }
    const encryptedCookie = encrypt(JSON.stringify(decryptedData));
    res.cookie('user-session', encryptedCookie, {
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
        httpOnly: true,
        sameSite: 'none'
    });
    res.send('Answer saved')
})

app.post('/submit', (req, res) => {
    const cookie = req.cookies['user-session'];
    const decryptedData = JSON.parse(decrypt(cookie));
    const scoreBoard = {
        totalScore: 0,
        correct: 0,
        incorrect: 0
    }
    decryptedData.questions.forEach((question, index) => {
        if(decryptedData.answers[index]?.[0] === question.correct_answer){
            scoreBoard.correct += 1;
        }
        else {
            scoreBoard.incorrect += 1;
        }
    })
    scoreBoard.totalScore =( scoreBoard.correct / decryptedData.questions.length) * 100;
    res.send(scoreBoard)
})

// app.listen(8000, () => {
//     console.log("Server is running on port 8000");
//     });

module.exports = app;
