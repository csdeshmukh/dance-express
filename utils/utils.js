const moment = require("moment");
const fs = require("fs");

const moment = require('moment');

exports.humanizeDate = (date) => {
    const postDate = moment(date);
    //console.log("post date", date, postDate.fromNow());
    return postDate.fromNow();
}

exports.generateOtp = (isDefault) => {
    const min = 100000;
    const max = 999999;
    let otp = 123456;
    if (!isDefault) {
        otp = Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return otp;
}

exports.makeDirectory = async (dirNamePath) => {
    const dirLogs = `"./${dirNamePath}`;
    if (!fs.existsSync(dirLogs)) {
        fs.mkdirSync(dirLogs);
    }
}