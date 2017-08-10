const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");


let context = {
  letters: [""],
  correctLetters: [""],
  wrongLetters: " ",
  replaceLetter: [],
  guessedLetters: [],
  guessesLeft: 8,
  duplicate: " ",
  gameMsg: ""
};

module.exports = {
  renderIndex: function (req, res){
    //this reflects the variable up top and allows the functions to update the content.
    context.letters = [""];
    context.correctLetters = [""];
    context.gameOver = "";
    context.guessedLetters = [];
    context.guessesLeft = 8;

    let gameWord = Math.floor(Math.random() * (words.length));
    //this is putting the random word in an array
    let randomWord = words[gameWord];
    console.log(randomWord);
    let letters = randomWord.split("");
    let correctLetters = randomWord.split("");

    //showing the letters as underscores
    for(var i = 0; i < letters.length; i++){
      letters[i] = "__";
    }

    //stores the letters
    context.letters = context.letters.concat(letters);
    context.letters.shift();
    context.correctLetters = context.correctLetters.concat(correctLetters);
    context.correctLetters.shift();
    req.session.word = context.letters;
    req.session.correctWord = context.correctLetters;
    res.render('index', context);
  },

  letterEntry: function (req, res) {
    //this is making sure the input takes only one letter
    req.checkBody('letter', 'only one letter').isLength({min: 1, max: 1});
    let errors = req.validationErrors();
    if (errors) {
      context.errors = errors;
    } else {
      context.errors = " ";
    }
    context.letter = req.body.letter;

    //replaces the blank string with the letter when user guesses right
    for (var i = 0; i < context.correctLetters.length; i++) {
      if (req.body.letter.toLowerCase() === context.correctLetters[i]) {
        context.duplicate = " ";
        context.letters[i] = context.correctLetters[i];
        req.session.word = context.letters;
      }
    } //if letter is not correct
    if (!context.correctLetters.includes(req.body.letter.toLowerCase())) {
      context.guessesLeft--;
      req.session.guessesLeft = context.guessesLeft;
      context.duplicate = " ";
    }
    context.duplicate = " ";

    //if duplicate letter was choosen
    if (context.guessedLetters.includes(req.body.letter.toLowerCase()) && !context.correctLetters.includes(req.body.letter.toLowerCase())) {
      context.guessesLeft++;
      req.session.guessesLeft = context.guessesLeft;
      context.duplicate = "letter has been used";
      //this is if the person uses the same letter a third time
    } else if (context.guessedLetters.includes(req.body.letter.toLowerCase()) && !context.correctLetters.includes(req.body.letter.toLowerCase())) {
      context.duplicate = "letter has been used";
    }
    //pushing letters to correct location
    if (req.body.letter.toLowerCase().length > 1) {
      context.guessesLeft++;
      req.session.guessesLeft = context.guessesLeft;
      context.duplicate = " ";

      //if input that is used, isn't already in the context, push the letter into the context
      //the reason is so we can reference letters used, any time a letter has been used
      //and tell if the letter has already been used.
    } else if (!context.guessedLetters.includes(req.body.letter.toLowerCase())) {
      context.guessedLetters.push(req.body.letter.toLowerCase());
      req.session.guessedLetters = context.guessedLetters;
    }
    //if the user wins
    if (!req.session.word.includes("__")) {
      context.gameOver = "You win! Play again?";
      req.session.gameMsg = context.gameMsg;
    }
    //if the user loses
    if (context.guessesLeft < 1) {
      let correctWord = context.correctLetters.join("");
      context.gameMsg = "You lose, the mystery word was " + correctWord + "." + "Play again?";
      req.session.gameMsg = context.gameMsg;
    }
    console.log(context);
    res.render('index', context);
  }
};
