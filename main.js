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
    // Explicitly preserve all AN lines
    if (line.startsWith('AN')) {
      newFileContent += line + '\n';
    }
    // Check if the line contains the text to be replaced
    else if (LineIs(line, 'AC')) {            // Store current AC
      let acValue = line.split(' ')[1];
      if (acValue === 'UNCLASSIFIED') {
        currentAC = 'R';
      } else {
        currentAC = acValue;
      }
    }              
    else if (LineIs(line, 'AY')) {       // AY found, now we can build the new AC line
      let currentAY = line.split(' ')[1];

      if (ACClasses.includes(currentAC)) {
        if (currentAC) {
          newFileContent += `AC ${currentAC}` + '\n';
        }
      }
      else if (AYDirectToAC.includes(currentAY)) {
        newFileContent += `AC ${currentAY}` + '\n';
      } 
      else {
        switch (currentAY) {
          case 'R':
            newFileContent += `AC R` + '\n';
            break;
          case 'W':
            newFileContent += `AC G` + '\n';
            break;
          case 'TMZ':
            newFileContent += `AC R` + '\n';
            break;
          case 'RMZ':
            newFileContent += `AC R` + '\n';
            break;
          case 'ASR':
            newFileContent += `AC R` + '\n';
            break;
          case 'GSEC':
            newFileContent += `AC G` + '\n';
            break;
          default:
            // Only write AC line if currentAC is not empty
            if (currentAC && currentAC.trim()) {
              newFileContent += `AC ${currentAC}` + '\n';
            }
            // else: skip writing empty AC line
            break;
        }
      }
      currentAC = '';
    } 
    else if (LineIs(line, 'AF') || LineIs(line, 'AG') || LineIs(line, 'AA')) {
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
      console.log(`File is updated successfully: ${outputFilename}`);
    });
  });
}

function LineIs(line, textToMatch) {
  return line.includes(`${textToMatch} `) && !line.includes("*");
}