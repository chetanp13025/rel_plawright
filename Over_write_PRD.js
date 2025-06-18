const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { parse } = require('json2csv');

const filePath = path.join(__dirname, 'csv_file', 'RL_PRD.csv');
const usedValues = new Set();

// Globals
global.IRD = '';
global.Article_IDS = [];
global.Serial1 = [];
global.tagList = [];

function generateUniqueRandomValue() {
  let val;
  do {
    val = '09' + Math.floor(Math.random() * 100000000);
  } while (usedValues.has(val));
  usedValues.add(val);
  return val;
}

function generateIRD() {
  return '100' + Math.floor(Math.random() * 100000);
}

function generateTagId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return 'a-' + Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function overwritePRD() {
  return new Promise((resolve, reject) => {
    const records = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', data => records.push(data))
      .on('end', () => {
        if (!records.length) {
          console.log('❌ No records found in PRD file!');
          return resolve();
        }

        // Reset data containers
        Article_IDS.length = 0;
        Serial1.length = 0;
        tagList.length = 0;

        IRD = generateIRD();

        records.forEach(record => {
          const keys = Object.keys(record);
          const tagId = generateTagId();

          // Overwrite key fields
          if (keys[0]) record[keys[0]] = IRD;                             // INWARD_REFERENCE_DOCUMENT_NUMBER
          if (keys[4]) record[keys[4]] = IRD;                             // INWARD_REASON_REFERENCE_DOCUMENT_NUMBER
          if (keys[28]) record[keys[28]] = generateUniqueRandomValue();  // SERIAL_NUMBER1
          if (keys[46]) record[keys[46]] = generateUniqueRandomValue();  // SERIAL_NUMBER2

          // Extract data
          if (keys[11]) Article_IDS.push(record[keys[11]]);              // SKU_CODE
          if (keys[28]) Serial1.push(record[keys[28]]);                  // SERIAL_NUMBER1

          tagList.push(tagId);
        });

        const csvString = parse(records, { fields: Object.keys(records[0]) });
        fs.writeFileSync(filePath, csvString);

        // Output summary
        // console.log(`✅ Overwritten ${records.length} records in PRD_whirlpool.csv`);
        // console.log('IRD:', IRD);
        // console.log('Article_IDs (SKU_CODE):', Article_IDS);
        // console.log('Serial Numbers (SERIAL_NUMBER1):', Serial1);
        // console.log('Generated Tag IDs:', tagList);

        resolve();
      })
      .on('error', reject);
  });
}

module.exports = {
  overwritePRD,
  getIRD: () => IRD,
  getArticleIds: () => Article_IDS,
  getSerials: () => Serial1,
  getTagList: () => tagList
};
// overwritePRD();
