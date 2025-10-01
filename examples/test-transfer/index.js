const dpixa = require("@pixagram/dpixa");

const tx = {
  amount: "0.001 PIXA",
  from: "petertag",
  to: "mahdiyari",
  memo: "test dpixa hivekings"
};
const privkey = "KEY HERE";

const client = new dpixa.Client("https://api.pixagram.io");
const key = dpixa.PrivateKey.fromString(privkey);
console.log(key);
const op = ["transfer", tx];
console.log(op);
client.broadcast
  .sendOperations([op], key)
  .then(res => console.log(res))
  .catch(err => console.log(err));
