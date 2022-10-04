var mod = {
  "float": (min,max) => {
    return (Math.random() *(max -min) +min);
  },
  "int": (min,max) => {
    return Math.floor(Math.random() *(max -min) +min);
  },
  "range": (min,max) => {
    return Math.floor(Math.random() *(max -min +1) +min);
  },
  "bool": () => {
    return !Math.floor(Math.random() *2);
  }
};
if (typeof module !== "undefined") {
  module.exports = mod;
} else {
  catto.random = mod;
}
