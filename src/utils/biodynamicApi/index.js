// const MoonCalc = require("mooncalc");

// const getMoonZodiac = async date => {
//   console.log("getMoonZodiac date", date);
//   try {
//     const res = await MoonCalc.datasForDay(`${date}`);
//     console.log("res", res)
//     return res;
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// };

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
const axios = require("axios");
// const egm96 = require("earthgravitymodel1996");
const { getAltitude, init } = require("sun-horizon");

const ApiError = require("../ApiError");
const moment = require("moment");
const apiUrl = "https://ipinfo.io/json";

const {
  MoonPhase,
  Equator,
  SearchMoonQuarter,
  NextMoonQuarter,
  Observer,
} = require("astronomy-engine");

//london observer= (51, 0, 11) long, lat, sea level in meters
// 0 = new moon, 1 = first quarter, 2 = full moon, 3 = third quarter.
const defaultGeo = {
  ip: "82.41.109.4",
  hostname: "cpc85194-haye23-2-0-cust3.17-4.cable.virginm.net",
  city: "London",
  region: "England",
  country: "GB",
  loc: "51.5085,-0.1257",
  org: "AS5089 Virgin Media Limited",
  postal: "EC1A",
  timezone: "Europe/London",
  readme: "https://ipinfo.io/missingauth",
  height: 11,
};

const getGeoData = async () => {
  try {
    const data = await axios.get(apiUrl);
    let geoData = await data.data;
    if (!geoData) 
      throw new ApiError(404, `No info found for that IP. Will use default info`);
    
    geoData = geoData || defaultGeo;

    const [latStr, lonStr] = geoData.loc.split(",");
    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lonStr);

    init();
    const origin = {
      lat: latitude,
      lng: longitude,
    };
    const altitude = await getAltitude(origin); // in meter
    console.log("altitude", altitude);
    Object.assign(geoData, {
      latitude,
      longitude,
      height: altitude,
    });
    console.log("geoData2", geoData);
    return geoData;
  } catch (error) {
    console.log(error);
  }
};

const getMoonInfo = async date => {
  const moonLong = await MoonPhase(parseFloat(date)); //expressed as an ecliptic longitude
  console.log("moonLong", moonLong);

  const perOfMoonCycle = moonLong / 360;
  console.log("perOfMoonCycle", perOfMoonCycle);
  const geoData = await getGeoData();
  const latitude = parseFloat(geoData.latitude);
  const longitude = parseFloat(geoData.longitude);
  const height = parseFloat(geoData.height);
  if (
    perOfMoonCycle < 0.033863193308711 ||
    perOfMoonCycle > 0.966136806691289
  ) {
    phase = "New Moon";
    trajectory = "ascendent";
  } else if (perOfMoonCycle < 0.216136806691289) {
    phase = "Waxing Crescent";
    trajectory = "ascendent";
  } else if (perOfMoonCycle < 0.283863193308711) {
    phase = "First Quarter";
    trajectory = "ascendent";
  } else if (perOfMoonCycle < 0.466136806691289) {
    phase = "Waxing Gibbous";
    trajectory = "ascendent";
  } else if (perOfMoonCycle < 0.533863193308711) {
    phase = "FULL";
    trajectory = "descendent";
  } else if (perOfMoonCycle < 0.716136806691289) {
    phase = "Waning Gibbous";
    trajectory = "descendent";
  } else if (perOfMoonCycle < 0.783863193308711) {
    phase = "Last Quarter";
    trajectory = "descendent";
  } else if (age < 0.966136806691289) {
    phase = "Waning Crescent";
    trajectory = "descendent";
  }

  if (moonLong < 33.18) {
    zodiac = "Pisces";
  } else if (moonLong < 51.16) {
    zodiac = "Aries";
  } else if (moonLong < 93.44) {
    zodiac = "Taurus";
  } else if (moonLong < 119.48) {
    zodiac = "Gemini";
  } else if (moonLong < 135.3) {
    zodiac = "Cancer";
  } else if (moonLong < 173.34) {
    zodiac = "Leo";
  } else if (moonLong < 224.17) {
    zodiac = "Virgo";
  } else if (moonLong < 242.57) {
    zodiac = "Libra";
  } else if (moonLong < 271.26) {
    zodiac = "Scorpio";
  } else if (moonLong < 302.49) {
    zodiac = "Sagittarius";
  } else if (moonLong < 311.72) {
    zodiac = "Capricorn";
  } else if (moonLong < 348.58) {
    zodiac = "Aquarius";
  } else {
    zodiac = "Pisces";
  }
  
  const observer = await new Observer(latitude, longitude, height);
  console.log("observer", observer);
  const moonPostion = await Equator("Moon", date, observer, true, true);
  console.log("moonPostion", moonPostion);
  const searchMoon = await SearchMoonQuarter(parseInt(date));
  console.log("searchMoon", searchMoon);
  const nextMoon = await NextMoonQuarter(searchMoon);
  console.log("nextMoonDetails", nextMoon);
  let nextMoonDay = moment(nextMoon.time.date).format("DD");
  console.log("nextMoonDay", nextMoonDay);
  // let currentMoonDay = moment(searchMoon.time.date).format("DD")
  // console.log("currentMoonDay",currentMoonDay )
  let currentDate = moment(new Date()).format("DD");

  let difference = parseInt(nextMoonDay) - currentDate;
  console.log("difference", difference);

  console.log("trajectory", trajectory);
  console.log("phase", phase);
  console.log("zodiac", zodiac);

  return {
    trajectory,
    moonPhase: phase,
    zodiac,
    nextNewMoon: difference
  };
};

module.exports = getMoonInfo;
