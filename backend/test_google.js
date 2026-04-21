const google = require('googlethis');
const options = {
  page: 0, 
  safe: false,
  parse_ads: false,
  additional_params: { 
    hl: 'en',
    gl: 'pk'
  }
};
google.search('iphone 15 price in pakistan', options).then(res => console.log('Found:', res.results.length)).catch(console.error);
