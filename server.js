const express = require("express");
const app = express();
const db = require("./db/logs");
require('dotenv').config();
const mailer = require("./mailer");
const sms = require("./sms");
const otp = require("./otpGen");

app.use(express.json());

app.post("/api/log", async (req, res) => {
  const createlog = await db.createNewLog(req.body);
  res.status(200).json( req.body );
});

app.delete("/api/log", async (req, res) => {
  await db.clearAllLogs();
  return res.status(200).json( req.body );
});

app.get("/api/log", async (req, res) => {
  const all_logs = await db.getAllLogs();
  res.status(200).json({ all_logs });
});

app.get("/api/users", async (req, res) => {
  const all_users = await db.getALLUsers();
  res.status(200).json({ all_users });
});

app.post("/api/login", async (req, res) => {
  const login = await db.login(req.body);
  console.log(login);
  if (login.userfound==true) {
    res.status(200).json({ success: true });
  }
  else {
    res.status(200).json({ success: false });
  }
});

app.post("/api/signup", async (req, res) => {
  const signup = await db.signup(req.body.aadharno);
  console.log(signup);
  if (signup.userexists == false) {
    newOtp = otp.generateOTP();
    // sms.sendSMS(req.body.mobile, newOtp);
    mailer.sendEmail(req.body.email, "Welcome to I4 HMI", "Your OTP is: " + newOtp);
    await db.makeTempUser(req.body, newOtp);
    res.status(200).json(req.body);
  }
  else {
    res.status(200).json({ message:"User Already Exists!" });
  }
});

app.post("/api/otp", async (req, res) => {
  const verification = await db.otpVerify(req.body.otp);
  console.log(verification);
  if (verification.otpvalid == true) {
    res.status(200).json({ success: true });
  }
  else {
    res.status(200).json({ success: false });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
