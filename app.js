const CSON = require('cson');
const sanitize = require('sanitize-filename');
const fs = require('fs');
const path = require('path');
const R = require('ramda');

const mkdirSync = function(dirPath) {
  try {
    fs.mkdirSync(dirPath);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
};

const notesDir =
  'C:\\Users\\bertolds\\Documents\\Projects\\_dropbox\\Dropbox\\notes\\Boostnote';

const outDir =
  'C:\\Users\\bertolds\\Documents\\Projects\\_dropbox\\Dropbox\\notes\\Boostnote\\notes\\out';

mkdirSync(outDir);

fs.readFile(path.join(notesDir, 'boostnote.json'), function(err, indexFile) {
  const index = JSON.parse(indexFile);

  fs.readdir(path.join(notesDir, 'notes'), function(err2, files) {
    if (err) {
      console.error('Could not list the directory.', err);
      process.exit(1);
    }

    files.forEach(function(file) {
      if (!fs.statSync(path.join(notesDir, 'notes', file)).isDirectory()) {
        const note = CSON.load(path.join(notesDir, 'notes', file));

        let filename = sanitize(note.title) + '.md';

        if (note.folder) {
          const folder = R.find(R.propEq('key', note.folder))(index.folders);
          if (folder) {
            filename = path.join(folder.name, filename);
            mkdirSync(path.join(outDir, folder.name));
          }
        }

        filename = path.join(outDir, filename);

        fs.writeFile(filename, note.content, function(err) {
          if (err) {
            return console.log(err);
          }

          console.log(`Exported ${filename}`);
        });
      }
    });
  });
});
