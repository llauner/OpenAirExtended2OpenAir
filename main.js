const fs = require('fs');
const readline = require('readline');
const stream = require('stream');

const ACClasses = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const AYDirectToAC = ['R', 'P', 'Q', 'CTR'];

// Get URL from command line parameters
const extendedFileName = process.argv[2];
const outputFilename = process.argv[3];

ReadAndProcess();

function ReadAndProcess() {
  const instream = fs.createReadStream(extendedFileName);
  const outstream = new stream;
  const rl = readline.createInterface(instream, outstream);

  let newFileContent = '';
  let currentAC = '';

  rl.on('line', function(line) {
    // Check if the line contains the text to be replaced
    if (LineIs(line, 'AC')) {            // Store current AC
      currentAC =  line.split(' ')[1];
    }              
    else if (LineIs(line, 'AY')) {       // AY found, now we can build the new AC line
      let currentAY = line.split(' ')[1];

      if (ACClasses.includes(currentAC)) {
        newFileContent += `AC ${currentAC}` + '\n';
      }
      else if (AYDirectToAC.includes(currentAY)) {
        newFileContent += `AC ${currentAY}` + '\n';
      } 
      else {
        switch (currentAY) {
          case 'W':
            newFileContent += `AC G` + '\n';
            break;
          case 'TMZ':
            newFileContent += `AC R` + '\n';
            break;
          case 'RMZ':
            newFileContent += `AC R` + '\n';
            break;
          case 'AERIAL_SPORTING_RECREATIONAL':
            newFileContent += `AC R` + '\n';
            break;
          default:
            newFileContent += `AC ${currentAC}` + '\n';
            break;
        }
      }
      currentAC = '';
    } 
    else if (LineIs(line, 'AF') || LineIs(line, 'AG')) {
      // Do nothing: not supported in standard format
    }
    else {
      // If the line doesn't contain the text to be replaced, add it as is
      newFileContent += line + '\n';
    }
  });

  rl.on('close', function() {
    // All lines are read, file is closed now.
    fs.writeFile(outputFilename, newFileContent, 'utf8', function(err) {
      if (err) throw err;
      console.log('File is updated successfully.');
    });
  });
}

function LineIs(line, textToMatch) {
  return line.includes(`${textToMatch} `) && !line.includes("*");
}