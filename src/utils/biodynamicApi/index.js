const MoonCalc = require("mooncalc");

var date = new Date();
var moonDatas = MoonCalc.datasForDay(date);
console.log(moonDatas);

const getMoonZodiac = async date => {
  console.log("date", date);
  try {
    const res = await MoonCalc.datasForDay(date);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
};

//   Date.prototype.addDays = function(days) {
//     const date = new Date(this.valueOf());
//     date.setDate(date.getDate() + days);
//     return date;
// }

// let date = new Date('09/31/2022'); // note - this has to be in (wrong) US time format

// console.log(date.addDays(5).toLocaleDateString());

// const userDate = new Date('09/31/2022');
// const phaseDate = new Date('09/20/2022');

// console.log(Math.round((userDate-phaseDate)/(1000*60*60*24))) // this is 11 so 11 days since the phase started

module.exports = { getMoonZodiac };
