const axios = require("axios");

const getAddressDetails = async fullAddress => {
  const params = {
    access_key: "3ec25b8b53f375610fcdf6171ded41de",
    query: `${fullAddress}`,
    country_module: 1,
    sun_module: 1,
  };
  try {
    const res = await axios.get("http://api.positionstack.com/v1/forward", {
      params,
    });
    const detailedAddress = await res.data;
    return detailedAddress;
  } catch (err) {
    console.log(err);
    return null;
  }
};

const getCoords = async city => {
  const params = {
    access_key: "3ec25b8b53f375610fcdf6171ded41de",
    query: `${city}`,
  };
  const cityCoords = {};
  try {
    const res = await axios.get("http://api.positionstack.com/v1/forward", {
      params,
    });
    console.log("res.data.data[0]", res.data.data[0]);
    const cityLat = await res.data.data[0].latitude;
    const cityLong = await res.data.data[0].longitude;
    const cityCoords = {
      latitude: cityLat,
      longitude: cityLong,
    };
    console.log("cityCoords", cityCoords);

    return cityCoords;
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = { getAddressDetails, getCoords };
