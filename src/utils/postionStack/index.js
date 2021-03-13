const axios = require('axios');


const getAddressDetails = async (address) => {
    const params = {
        access_key: '3ec25b8b53f375610fcdf6171ded41de',
        query: `${address}`
      }
    try {
        const res = await axios.get('http://api.positionstack.com/v1/forward', {params});
        const detailedAddress = await res.data
        return detailedAddress;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  module.exports = {getAddressDetails}

  
   
   
  