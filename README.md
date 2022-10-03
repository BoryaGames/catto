# catto
## Description

catto is a universal nodejs package manager module for:
- Creating sites.
- Making discord OAuth2 authorization.
- Use discord Bearer tokens.
- Generate random numbers and booleans.
- Much more!

## Usage
### Random
```js
var catto = require("catto");
catto.random.float(1,5); // 3.09551507480272448
catto.random.int(1,5); // 4
catto.random.range(1,5); // 3
catto.random.bool(); // false
```
### Creating a server/site
```js
var catto = require("catto");
// For creating a server you need to specify domain (necessarily)
// Port, SSL status, SSL certificate, SSL key, SSL only options and noserver mode and optional
var server = new catto.server("example.com",443,true,"ssl.cert","ssl.key",{},false);
// catto.server.fa means FA - Fast Answer, you don't need any function and response.end for it to work, just use it to send basic text data or a HTML page.
server.get("/",catto.server.fa("Hello World!")).post("/cat",(req, res) => {
  // POST requests with body! JSON's parsed automatically.
  req.body.meow; // Meow!
}).ws("/connectme",(ws, req) => {
  // WebSocket is also supported!
}).start().on("started",() => {
  // A start event.
  console.log("Server has started!");
});
```
### Discord Authorization
```js
var catto = require("catto");
// You need a server/site for that.
var server = new catto.server("example.com");
// You need to specify server, scopes, client ID and a client secret.
var authclient = new catto.auth.client(server,["identify"],"12345678910","12345qwerty");
server.get("/login",(req,res) => {
  // Path /login redirects to authorization.
  authclient.redirect(res);
}).get("/api/cauth",(req,res) => {
  // After authorization it redirects to /api/cauth and then you handle authorization.
  authclient.auth(req);
}).start();
authclient.on("token",async () => {
  // This event emits, when your app has got a token.
  // To get user info you must do sync (it's async function).
  await authclient.sync();
  authclient.user.id; // id of a loginned user.
});
```
### Discord Authorization 2
```js
var catto = require("catto");
var server = new catto.server("example.com");
// If you want to load user session after restarting, you must specify accessToken, expire and refreshToken in options.
var authclient = new catto.auth.client(server,["identify"],"12345678910","12345qwerty",{
  "accessToken": "12345qwerty",
  "expire": 12345,
  "refreshToken": "12345qwerty"
});
// After it, event "token" will not emit, because it's already ready
// But first, you must check, if user session if avaliable
if (!authclient.expired) {
  // Do your code
} else {
  // If user session is expired (7 days), you must renew it, when it done it will emit "token" event and you must save new data
  authclient.renew();
}
```
### Discord Authorization 3
```js
var catto = require("catto");
var server = new catto.server("example.com");
// Scopes
var authclient = new catto.auth.client(server,["identify","email","guilds","connections"],"12345678910","12345qwerty");
server.get("/login",(req,res) => {
  authclient.redirect(res);
}).get("/api/cauth",(req,res) => {
  authclient.auth(req);
}).start();
authclient.on("token",async () => {
  // .sync() works only when identify (or/and) email are present.
  // identify - ID, username, discriminator, tag, avatar, banner color, accent color, banner, avatar hash, flags and more.
  // email - adds user email and is email verified to identify
  await authclient.sync();
  // .syncGuilds() works only when guilds is present.
  // guilds - get guilds, where user is (max 200)
  await authclient.syncGuilds();
  // .syncConnections() works only when connections is present.
  // connections - get user connections.
  await authclient.syncConnections();
});
```
### Discord Authorization 4
```js
var catto = require("catto");
var server = new catto.server("example.com");
// Scopes
var authclient = new catto.auth.client(server,["identify","guilds.join"],"12345678910","12345qwerty",{
  "botToken": "12345qwerty" // You must specify bot token and bot has to added to server, which you want user to join.
});
server.get("/login",(req,res) => {
  authclient.redirect(res);
}).get("/api/cauth",(req,res) => {
  authclient.auth(req);
}).start();
authclient.on("token",async () => {
  // To join to server you must have scopes identify and guilds.join and first you must do .sync()
  await authclient.sync();
  // Join server, you must specify guild ID.
  await authclient.joinGuild("12345678910");
  // Done, user has added to that server!
});
```
### Discord Authorization 5
```js
var catto = require("catto");
var server = new catto.server("example.com");
var authclient = new catto.auth.client(server,["identify"],"12345678910","12345qwerty",{
  "accessToken": "12345qwerty",
  "expire": 12345,
  "refreshToken": "12345qwerty"
});
server.get("/logout",(req,res) => {
  // If you want to logout user you can delete his token, it will emit "remove" event
  authclient.remove();
}).start();
authclient.on("remove",() => {
  // Done, token no more works.
});
```
