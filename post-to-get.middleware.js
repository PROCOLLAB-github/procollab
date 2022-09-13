/** @format */

const whiteList = ["empty", "invite", "files"];
module.exports = function (req, res, next) {
  if (whiteList.map(url => req.url.includes(url)).some(Boolean)) {
    req.method = "GET";
  }

  next();
};
