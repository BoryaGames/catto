Array.prototype.remove = id => {
  this.splice(id,1);
};
String.prototype.json = () => {
  return JSON.parse(this);
};
Object.prototype.str = () => {
  return JSON.stringify(this);
};
module.exports = {
  "server": require("./server.js"),
  "random": require("./random.js"),
  "auth": require("./auth.js")
};
