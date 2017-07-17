const fs = require('fs');

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");


module.exports = words;
