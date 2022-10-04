if (typeof require !== "undefined") {
  var express = require("express");
  var expressWs = require("express-ws");
  var events = require("events");
  var EventEmitter = events.EventEmitter;
  var http = require("http");
  var https = require("https");
  var fs = require("fs");
  var path = require("path");
  var bodyParser = require("body-parser");
  var urlencodedParser = bodyParser.urlencoded({"extended":!0});
  var jsonParser = bodyParser.json();
} else {
  var EventEmitter = class {};
}
var mod = class extends EventEmitter {
  constructor(dom,port,ssl,cert,key,sslopts,usedef) {
    super();
    this.dom = dom;
    this.port = port || process.env.PORT || 80;
    this.app = express();
    this.ssl = ssl;
    if (this.ssl) {
      this.server = https.createServer(Object.assign(sslopts,{"cert":fs.readFileSync(path.join(__dirname,"..","..",this.cert),"utf8"),"key":fs.readFileSync(path.join(__dirname,"..","..",this.key),"utf8")}),this.app);
      this.cert = cert;
      this.key = key;
    } else {
      if (usedef) {
        this.server = this.app;
      } else {
        this.server = http.createServer(this.app);
      }
    }
    this.expressWsi = expressWs(this.app,this.server);
    this.app.use(urlencodedParser);
    this.app.use(jsonParser);
  }
  start() {
    this.server.listen(this.port,() => {
      this.emit("started");
    });
    return this;
  }
  all(...args) {
    this.app.all(...args);
    return this;
  }
  delete(...args) {
    this.app.delete(...args);
    return this;
  }
  disable(...args) {
    this.app.disable(...args);
    return this;
  }
  disabled(...args) {
    this.app.disabled(...args);
    return this;
  }
  enable(...args) {
    this.app.enable(...args);
    return this;
  }
  enabled(...args) {
    this.app.enabled(...args);
    return this;
  }
  engine(...args) {
    this.app.engine(...args);
    return this;
  }
  get(...args) {
    this.app.get(...args);
    return this;
  }
  param(...args) {
    this.app.param(...args);
    return this;
  }
  path(...args) {
    this.app.path(...args);
    return this;
  }
  post(...args) {
    this.app.post(...args);
    return this;
  }
  put(...args) {
    this.app.put(...args);
    return this;
  }
  render(...args) {
    this.app.render(...args);
    return this;
  }
  route(...args) {
    this.app.route(...args);
    return this;
  }
  set(...args) {
    this.app.set(...args);
    return this;
  }
  use(...args) {
    this.app.use(...args);
    return this;
  }
  ws(...args) {
    this.app.ws(...args);
    return this;
  }
  static(folder) {
    return this.use(express.static(path.join(__dirname,"..","..",folder)));
  }
  static fa(text) {
    return (req,res) => {
      res.end(text);
    };
  }
};
if (typeof module !== "undefined") {
  module.exports = mod;
}
