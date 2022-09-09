/** @format */

const whiteList = ["profile", "empty"];
module.exports = function (req, res, next) {
  if (whiteList.map(url => req.url.includes(url)).some(Boolean)) {
    req.method = "GET";
  }

  next();
};
