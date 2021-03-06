//Initial set-up
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const moment = require("moment");
const { getAltitude, init } = require("sun-horizon");
const {
  MoonPhase,
  Equator,
  SearchMoonQuarter,
  NextMoonQuarter,
  Observer,
  MakeTime,
  SearchMoonPhase,
} = require("astronomy-engine");
// SearchMoonQuarter 0 = new moon, 1 = first quarter, 2 = full moon, 3 = third quarter.

//Models
const VineyardModel = require("../../services/vineyards/schema");

//Error Handling
const ApiError = require("../ApiError");

const apiUrl = "https://ipinfo.io/json";

// const vineyardGeoDetails = async (req, res, next) => {
//   try {
//     console.log("req", req)
//     const vineyard = await VineyardModel.find(req.params.vineyardId);
//     const vineyardGeo = {
//       city: `${vinyard.address.city}`,
//       region: `${vinyard.address.region}`,
//       country: `${vinyard.address.country}`,
//       latitude: `${vinyard.details.latitude}`,
//       longitude: `${vinyard.details.longitude}`,
//     };
//     if (vineyardGeo) return vineyardGeo;
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };

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
  height: 24.392000000009254,
};

const getUserGeoData = async () => {
  try {
    const data = await axios.get(apiUrl);
    let geoData = await data.data;
    if (!geoData)
      throw new ApiError(
        404,
        `No info found for that IP. Will use default info`
      );
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
  console.log("get mooninfo date", date);

  const moonLong = await MoonPhase(date); //expressed as an ecliptic longitude
  console.log("moonLong", moonLong);

  const perOfMoonCycle = moonLong / 360;
  console.log("perOfMoonCycle", perOfMoonCycle);
  const userGeoData = await getUserGeoData();
  const latitude = parseFloat(userGeoData.latitude);
  const longitude = parseFloat(userGeoData.longitude);
  const height = parseFloat(userGeoData.height);

  if (perOfMoonCycle < 0.033863193308711) {
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
    phase = "Full";
    trajectory = "descendent";
  } else if (perOfMoonCycle < 0.716136806691289) {
    phase = "Waning Gibbous";
    trajectory = "descendent";
  } else if (perOfMoonCycle < 0.783863193308711) {
    phase = "Last Quarter";
    trajectory = "descendent";
  } else if (perOfMoonCycle < 0.966136806691289) {
    phase = "Waning Crescent";
    trajectory = "descendent";
  }

  if (moonLong < 6.18) {
    zodiac = "Aries";
  } else if (moonLong < 36.16) {
    zodiac = "Taurus";
  } else if (moonLong < 66.44) {
    zodiac = "Gemini";
  } else if (moonLong < 90) {
    zodiac = "Cancer";
  } else if (moonLong < 125.3) {
    zodiac = "Leo";
  } else if (moonLong < 145.5) {
    zodiac = "Virgo";
  } else if (moonLong < 175) {
    zodiac = "Libra";
  } else if (moonLong < 210.57) {
    zodiac = "Scorpio";
  } else if (moonLong < 241.26) {
    zodiac = "Sagittarius";
  } else if (moonLong < 270.49) {
    zodiac = "Capricorn";
  } else if (moonLong < 300.72) {
    zodiac = "Aquarius";
  } else if (moonLong < 336.58) {
    zodiac = "Pisces";
  } else zodiac = "Aries"

  // switch (zodic) {
  //   case "Taurus":
  //   case "Virgo":
  //   case "Capricorn":
  //     return
  //     house = "Earth";
  //     bioDay = "Root";
  // }
  if (zodiac == "Taurus" || zodiac == "Virgo" || zodiac == "Capricorn") {
    house = "Earth";
    bioDay = "Root";
  } else if (zodiac == "Gemini" || zodiac == "Libra" || zodiac == "Aquarius") {
    house = "Air";
    bioDay = "Flower";
  } else if (zodiac == "Pisces" || zodiac == "Cancer" || zodiac == "Scorpio") {
    house = "Water";
    bioDay = "Leaf";
  } else if (zodiac == "Aries" || zodiac == "Leo" || zodiac == "Sagittarius") {
    house = "Light & Fire";
    bioDay = "Fruit";
  }

  const observerPos = await new Observer(latitude, longitude, height);
  console.log("observer", observerPos);
  const moonPostion = await Equator("Moon", date, observerPos, true, true);
  console.log("moonPostion", moonPostion);
  const searchMoon = await SearchMoonQuarter(date);
  console.log("searchMoon", searchMoon);
  const nextMoon = await NextMoonQuarter(searchMoon);
  console.log("nextMoon.time.date", nextMoon.time.date);
  let nextMoonDay = moment(nextMoon.time.date).format("DD");
  console.log("nextMoonDay", nextMoonDay);
  let currentMoonDay = moment(searchMoon.time.date).format("DD");
  console.log("currentMoonDay", currentMoonDay);
  let currentDate = moment(new Date()).format("DD");

  // let difference = parseInt(nextMoonDay) - currentDate;
  // console.log("difference", difference);

  console.log("date", date);
  const nextFullMoon = SearchMoonPhase(180, date, 30);

  if (bioDay == "Leaf") {
    nextFruitDay = "less than 2.5 days away";
  } else if (bioDay == "Flower") {
    nextFruitDay = "less than 5 days away";
  } else if (bioDay == "Root") {
    nextFruitDay = "less than 7.5 days away";
  } else if (bioDay == "Fruit") {
    nextFruitDay = null;
  }

  const bioObject = {
    resultsDate: date,
    trajectory,
    moonPhase: phase,
    zodiac,
    house,
    bioDay,
    nextFruitDay,
    nextFullMoon,
  };
  console.log("bioObject", bioObject);
  return {
    bioObject,
  };
};

module.exports = getMoonInfo;
