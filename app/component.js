module.exports = (function() {
  'use strict';
  let http = require('http');

  let getVersion = (name, cb) => {
    http.get(`http://api.diversity.io/components/${name}/*/`, res => {
      res.setEncoding('utf8');
      res.on('data', comp => {
        comp = JSON.parse(comp);
        cb(comp.version);
      })
    })
  }

  return {getVersion: getVersion};
})();
