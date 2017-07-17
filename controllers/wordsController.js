const bodyParser = require('body-parser');
const parseurl = require('parseurl');
const expressValidator = require('express-validator');
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
const randNum = Math.floor(Math.random() * (words.length));
const randWord = words[randNum];
const letters = randWord.split(" ");
const correctLetters = randWord.split(" ");


let context = {
  letters: [""],
  correctLetters: [""],
  wrongLetters: " ",
  replaceLetter: [],
  guessedLetters: [],
  guessesLeft: 8,
  duplicateError: " ",
  message: ""
};


module.exports = {
  renderIndex: function (req, res){
    context.letters = [""];
    context.correctLetters = [""];
    context.message = "";
    context.guessedLetters = [];
    context.guessesLeft = 8;


    for(var i = 0; i < letters.length; i++){
      letters[i] = "__";
    }

    //handles letter storage
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
    req.checkBody('player_input', 'one letter only').isLength({min: 1, max: 1});
    let errors = req.validationErrors();
    if (errors) {
      context.errors = errors;
    } else {
      context.errors = " ";
    }
    context.player_input = req.body.player_input;

    //fills in blank with correctly guessed letter
    for (var i = 0; i < context.correctLetters.length; i++) {
      if (req.body.player_input.toLowerCase() === context.correctLetters[i]);
        context.duplicateError = ("");
        context.letters[i] = context.correctLetters[i];
        req.session.word = context.letters;
      }
    } //reduces number of guesses left after incorrect guess
    if (!context.correctLetters.includes(req.body.player_input.toLowerCase()){
      context.guessesLeft--;
      req.session.guessesLeft = context.guessesLeft;
      context.duplicateErrorMsg = ' ';
    }
      context.duplicateErrorMsg = ' ';

      //does not reduce number of guesses for duplicate incorrect guesses
    if (context.guessedLetters.includes(req.body.player_input.toLowerCase()) && !context.correctLetters.includes(req.body.player_input.toLowerCase())) {
      context.guessesLeft++;
      req.session.guessesLeft = context.guessesLeft;
      context.duplicateError = "letter has been used";

      //does not reduce number of guesses but returns error for letter guessed more than twice
    } else if (context.guessedLetters.includes(req.body.player_input.toLowerCase()) && !context.correctLetters.includes(req.body.letter.toLowerCase())) {
      context.duplicateError = "letter has been used";
    }

    if (req.body.letter.toLowerCase().length > 1) {
      context.guessesLeft++;
      req.session.guessesLeft = context.guessesLeft;
      context.duplicateError = " ";

      //stores guessed letters inside an array
    } else if (!context.guessedLetters.includes(req.body.player_input.toLowerCase())) {
      context.guessedLetters.push(req.body.player_input.toLowerCase());
      req.session.guessedLetters = context.guessedLetters;
    }
    //if the user wins
    if (!req.session.word.includes("__")) {
      context.message = "You win! Want to play again?";
      req.session.message = context.message;
    }
    //if the user loses
    if (context.guessesLeft < 1) {
      let correctWord = context.correctLetters.join("");
      context.message = "You lose, the word was" + correctWord + "." + "Want to play again?";
      req.session.message = context.message;
    }
    res.render('index', context);

}
