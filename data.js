const mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  database: "gaming",
  user: "root",
  password: ""
});
module.exports = con;

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});