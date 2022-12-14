if (typeof require !== "undefined") {
  var request = require("request");
  var events = require("events");
  var EventEmitter = events.EventEmitter;
} else {
  var EventEmitter = class {};
}
var mod = {
  "client": class extends EventEmitter {
    constructor(server,scopes,id,secret,options) {
      super();
      this.server = server;
      this.scopes = scopes;
      this.id = id;
      this.secret = secret;
      if (typeof options === "object" && options.tokenType && options.accessToken && options.expires && options.refreshToken) {
        this.tokenType = options.tokenType;
        this.accessToken = options.accessToken;
        if (typeof options.expires === "number") {
          this.expires = new Date(options.expires);
        } else {
          this.expires = options.expires;
        }
        this.refreshToken = options.refreshToken;
      } else {
        this.tokenType = null;
        this.accessToken = null;
        this.expires = null;
        this.refreshToken = null;
      }
      if (typeof options === "object" && options.botToken) {
        this.botToken = options.botToken;
      } else {
        this.botToken = null;
      }
      this.apiv = 10;
      this.user = {};
      this.guilds = [];
      this.connections = [];
    }
    link() {
      return `https://discord.com/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(this.id)}&scope=${encodeURIComponent(this.scopes.join(" "))}&redirect_uri=${encodeURIComponent(this.buildRedirectUri())}&prompt=none`;
    }
    redirect(res) {
      res.redirect(this.link());
    }
    buildRedirectUri() {
      return `http${(this.server.ssl?"s":"")}://${this.server.dom}/api/cauth`;
    }
    auth(req) {
      request.post({"url":"https://discord.com/api/oauth2/token","form":{
        "client_id": this.id,
        "client_secret": this.secret,
        "grant_type": "authorization_code",
        "code": req.query.code,
        "redirect_uri": this.buildRedirectUri()
      }},(error,response,body) => {
        if (error) {
          throw error;
        }
        if (response.statusCode == 200) {
          this.writeToken(JSON.parse(body));
          this.emit("token");
        }
      });
    }
    sync() {
      return new Promise((res,rej) => {
        request.get({"url":`https://discord.com/api/v${this.apiv.toString()}/users/@me`,"headers":{
          "Authorization": `${this.tokenType} ${this.accessToken}`
        }},(error,response,body) => {
          if (error) {
            throw error;
          }
          if (response.statusCode == 200) {
            this.user = this.patchUser(JSON.parse(body));
            res();
          } else {
            rej(response,body);
          }
        });
      });
    }
    getUser(userid) {
      if (!this.botToken) {
        throw `You must specify a bot token in options as "botToken".`;
      }
      if (!userid) {
        throw "You must specify user ID.";
      }
      return new Promise((res,rej) => {
        request.get({"url":`https://discord.com/api/v${this.apiv.toString()}/users/${userid}`,"headers":{
          "Authorization": `Bot ${this.botToken}`
        }},(error,response,body) => {
          if (error) {
            throw error;
          }
          if (response.statusCode == 200) {
            res(this.patchUser(JSON.parse(body)));
          } else {
            rej(response,body);
          }
        });
      });
    }
    patchUser(obj) {
      obj.tag = `${obj.username}#${obj.discriminator}`;
      obj.getAvatar = () => {
        if (obj.avatar) {
          if (obj.avatar.startsWith("a_")) {
            return `https://cdn.discordapp.com/avatars/${obj.id}/${obj.avatar}.gif?size=4096`;
          } else {
            return `https://cdn.discordapp.com/avatars/${obj.id}/${obj.avatar}.png?size=4096`;
          }
        } else {
          return `https://cdn.discordapp.com/embed/avatars/${(obj.discriminator %5).toString()}.png`;
        }
      };
      return obj;
    }
    syncGuilds() {
      if (!this.scopes.includes("guilds")) {
        throw `Missing scope "guilds".`;
      }
      return new Promise((res,rej) => {
        request.get({"url":`https://discord.com/api/v${this.apiv.toString()}/users/@me/guilds`,"headers":{
          "Authorization": `${this.tokenType} ${this.accessToken}`
        }},(error,response,body) => {
          if (error) {
            throw error;
          }
          if (response.statusCode == 200) {
            this.guilds = JSON.parse(body);
            res();
          } else {
            rej(response,body);
          }
        });
      });
    }
    syncConnections() {
      if (!this.scopes.includes("connections")) {
        throw `Missing scope "connections".`;
      }
      return new Promise((res,rej) => {
        request.get({"url":`https://discord.com/api/v${this.apiv.toString()}/users/@me/connections`,"headers":{
          "Authorization": `${this.tokenType} ${this.accessToken}`
        }},(error,response,body) => {
          if (error) {
            throw error;
          }
          if (response.statusCode == 200) {
            this.connections = JSON.parse(body);
            res();
          } else {
            rej(response,body);
          }
        });
      });
    }
    writeToken(body) {
      this.tokenType = body.token_type;
      this.accessToken = body.access_token;
      this.expires = new Date(Date.now() +(this.expires_in *1e3));
      this.refreshToken = body.refresh_token;
    }
    get expired() {
      return (Date.now() >= this.expires.getTime());
    }
    renew() {
      request.post({"url":"https://discord.com/api/oauth2/token","form":{
        "client_id": this.id,
        "client_secret": this.secret,
        "grant_type": "refresh_token",
        "refresh_token": this.refreshToken
      }},(error,response,body) => {
        if (error) {
          throw error;
        }
        if (response.statusCode == 200) {
          this.writeToken(JSON.parse(body));
          this.emit("token");
        }
      });
    }
    remove() {
      request.post({"url":"https://discord.com/api/oauth2/token/revoke","form":{
        "client_id": this.id,
        "client_secret": this.secret,
        "token": this.accessToken
      }},(error,response,body) => {
        if (error) {
          throw error;
        }
        if (response.statusCode == 200) {
          this.writeToken({});
          this.emit("remove");
        }
      });
    }
    joinGuild(guildid) {
      if (!this.scopes.includes("identify")) {
        throw `Missing scope "identify".`;
      }
      if (!this.scopes.includes("guilds.join")) {
        throw `Missing scope "guilds.join".`;
      }
      if (!this.botToken) {
        throw `You must specify a bot token in options as "botToken".`;
      }
      if (!this.user || !this.user.id) {
        throw `You must do "<client>.sync()" first.`;
      }
      if (!guildid) {
        throw "You must specify guild ID.";
      }
      return new Promise((res,rej) => {
        request.put({"url":`https://discord.com/api/v${this.apiv.toString()}/guilds/${guildid}/members/${this.user.id}`,"headers":{
          "Authorization": `Bot ${this.botToken}`,
          "Content-Type": "application/json"
        },"body":{
          "access_token": this.accessToken
        },"json":!0},(error,response,body) => {
          if (error) {
            throw error;
          }
          if (response.statusCode == 201 || response.statusCode == 204) {
            res();
          } else {
            rej(response,body);
          }
        });
      });
    }
  }
};
if (typeof module !== "undefined") {
  module.exports = mod;
} else {
  catto.auth = mod;
}
