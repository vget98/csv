const fs = require('fs');
const csv = require('csv-parser');

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
  timestamp: (str)=> str && new Date(str).toISOString(), //TODO: convert to eastern prob add some hours
  zipcode: (str) => str && str.padStart(5, 0),
  names: (str) => str && str.toUpperCase(),
  duration: (duration) => {
    const [hours, minutes, seconds] = duration.split(':');
    return [hours, minutes, parseInt(seconds, 10)].join(':');
  },
  addDurations: (duration1, duration2) => {
    if (!duration1 || !duration2) return;
    return converTimeToSeconds(duration1) + converTimeToSeconds(duration2)
  }
};

const results = [];

fs.createReadStream('sample.csv')
  .pipe(csv())
  .on('data', ({ Timestamp, Address, FullName, address, ZIP, FooDuration, BarDuration, Notes }) => {
    const rowResults = [];
    rowResults.push(normalize.timestamp(Timestamp));
    rowResults.push(normalize.names(FullName)); // turn uppercase
    rowResults.push(Address); // address should be passed as is
    rowResults.push(normalize.zipcode(ZIP));
    rowResults.push(normalize.duration(FooDuration));
    rowResults.push(normalize.duration(BarDuration));
    rowResults.push(normalize.addDurations(FooDuration, BarDuration));
    rowResults.push(Notes);
    results.push(rowResults.join(' '));
  })
  .on('headers', (headers) => {
    console.log(headers.join(' '));
  })
  .on('end', () => {
    console.log(results.join('\n'));
  });
