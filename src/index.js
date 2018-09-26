const fs = require('fs');
const csv = require('csv-parser');

// UTIL FUNCTIONS //

const convertTimeZone = (str) => {
  const offset = -5.0; // SUBTRACT THIS OFFSET
  const date = new Date(str);
  const est = utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(est + (3600000*offset));
};

const converTimeToSeconds = (str) => {
  const time = str.split(':');
  let seconds = 0;
  let minutes = 1;
  while (time.length > 0) {
      seconds += minutes * parseInt(time.pop(), 10);
      minutes *= 60;
  }
  return seconds;
};

const normalize = {
  timestamp: (dataStr) => dataStr && new Date(convertTimeZone(dataStr)).toISOString(),
  zipcode: (zipcode) => zipcode && zipcode.padStart(5, 0),
  names: (name) => name && name.toUpperCase(),
  duration: (duration) => {
    const [hours, minutes, seconds] = duration.split(':');
    return [hours, minutes, parseInt(seconds, 10)].join(':');
  },
  addDurations: (duration1, duration2) => {
    if (!duration1 || !duration2) return;
    return converTimeToSeconds(duration1) + converTimeToSeconds(duration2)
  }
};

// UTIL FUNCTIONS END //

const results = [];

fs.createReadStream('sample.csv')
  .pipe(csv())
  .on('data', ({ Timestamp, Address, FullName, address, ZIP, FooDuration, BarDuration, Notes }) => {
    const rowResults = [];
    rowResults.push(normalize.timestamp(Timestamp)); // convert to ISO and EST
    rowResults.push(normalize.names(FullName)); // turn uppercase
    rowResults.push(Address); // address should be passed as is
    rowResults.push(normalize.zipcode(ZIP)); // pad to ensure 5 digits
    rowResults.push(normalize.duration(FooDuration)); // convert to floating point seconds
    rowResults.push(normalize.duration(BarDuration)); // convert to floating point seconds
    rowResults.push(normalize.addDurations(FooDuration, BarDuration)); // // convert to floating point seconds and add together
    rowResults.push(Notes); // leave the same
    results.push(rowResults.join(' '));
  })
  .on('headers', (headers) => {
    console.log(headers.join(' ')); // log out headers first
  })
  .on('end', () => {
    console.log(results.join('\n'));
  });
