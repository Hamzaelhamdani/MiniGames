/**
 * Utility functions for Solidaire Maxit
 */

/**
 * Format date to readable string
 * @param {Date} date 
 * @returns {string}
 */
const formatTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`;
};

/**
 * Pad number with leading zero
 * @param {number} n 
 * @returns {string}
 */
const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

/**
 * Generate random integer between min and max (inclusive)
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Shuffle array in place
 * @param {Array} array 
 * @returns {Array}
 */
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Deep clone an object
 * @param {Object} obj 
 * @returns {Object}
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

module.exports = {
  formatTime,
  formatNumber,
  randomInt,
  shuffleArray,
  deepClone
};
