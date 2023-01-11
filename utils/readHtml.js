const tryCatchError = require('../middleware/tryCatchError');

const fs = require('fs').promises;
const readHTML = tryCatchError(async(path) => {
  const html = await fs.readFile(path, {encoding:"utf-8"})
  return html
})

module.exports = readHTML