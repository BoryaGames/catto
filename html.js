var mod = {
  "disable": text => {
    return text.split("<").join("&lt;").split(">").join("&gt;");
  }
};
if (typeof module !== "undefined") {
  module.exports = mod;
} else {
  catto.html = mod;
}
