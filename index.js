if (typeof require !== "undefined") {
  var mod = {
    "server": require("./server.js"),
    "random": require("./random.js"),
    "auth": require("./auth.js"),
    "html": require("./html.js")
  };
} else {
  var mod = {};
}
if (typeof module !== "undefined") {
  module.exports = mod;
} else {
  this.catto = mod;
}
if (typeof require === "undefined" && typeof document !== "undefined") {
  ["server.js","random.js","auth.js","html.js"].forEach(p => {
    var s = document.createElement("script");
    s.src = p;
    document.head.appendChild(s);
  });
}
