/* */ 
(function(Buffer) {
  'use strict';
  var isUtf8 = require('is-utf8');
  module.exports = function(x) {
    if (typeof x === 'string' && x.charCodeAt(0) === 0xFEFF) {
      return x.slice(1);
    }
    if (Buffer.isBuffer(x) && isUtf8(x) && x[0] === 0xEF && x[1] === 0xBB && x[2] === 0xBF) {
      return x.slice(3);
    }
    return x;
  };
})(require('buffer').Buffer);
