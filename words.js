var fs = require('fs'),
readline = require('readline');
const regex = /^[filnptuvwxyz]+$/;

var rd = readline.createInterface({
    input: fs.createReadStream('corncob_lowercase.txt'),
 //   output: process.stdout,
    console: false
});

rd.on('line', function(line) {
    if (line.trim().match(regex)) {
      console.log(line)
    }
});

