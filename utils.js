const fs = require("fs");

module.exports = function saveToCSV(fileName, data, isAppending = false) {
  if (!Array.isArray(data)) return null;
  let isTable = true;

  data.forEach((row) => {
    if (!Array.isArray(row)) isTable = false;
  });

  if (!isTable) return null;

  data.forEach((row, index) => {
    if (isAppending && fs.existsSync(fileName) && index === 0) return;

    const stringRow = row.join(";") + "\n";
    try {
      fs.appendFileSync(fileName, stringRow);
    } catch (error) {
      console.error(error);
    }
  });
};
