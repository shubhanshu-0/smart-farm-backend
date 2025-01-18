const express = require('express');
const router = express.Router();
const Farmer = require('../models/farmer'); 
const Secretary = require('../models/secretary');
const Admin = require('../models/admin'); 

const sendOtp = (mobileNumber) => {
    console.log(`Sending OTP to ${mobileNumber}`);
    return '123456'; 
};

// In-memory storage for OTPs (use a database in production)
let storedOtp = new Map(); 

router.post('/select-user-type', (req, res) => {
    const { userType } = req.body;

    if (!userType) {
        return res.status(400).json({ message: 'User type is required.' });
    }
    try {
        req.session.userType = userType; 
        return res.status(200).json({ success : true , message: `User type selected: ${userType}. Please enter your mobile number.` });
    } catch (error) {
        return res.status(401).json({message : 'Failure!'});
    }
   
});

router.post('/enter-mobile', (req, res) => {
    const { mobileNumber } = req.body;
    // const userType = req.session.userType;
    try{
        req.session.mobileNumber = mobileNumber;
        if (!mobileNumber) {
            return res.status(400).json({ message: 'Mobile number is required.' });
        }

        const otpToSend = sendOtp(mobileNumber);
        storedOtp[mobileNumber] = otpToSend;  // use twilio service 
        return res.status(201).json({ message: `OTP sent to ${mobileNumber}. Please verify it.` });
    }
    catch(err){
        return res.status(400).json({message: 'Cannot Validate OTP !'});
    }
});

router.post('/verify-otp', async (req, res) => {
    const userType = req.session.userType;
    const mobileNumber = req.session.mobileNumber;
    const { otp } = req.body;



    if (!mobileNumber || !otp) {
        return res.status(400).json({ message: 'Mobile number and OTP are required.' });
    }

    //use twilio service and store the otp in storedOtp[] 

    if (storedOtp[mobileNumber] && otp === storedOtp[mobileNumber]) {   
        delete storedOtp[mobileNumber]; 

        let user;
        switch (userType) {
            case 'farmer':
                user = await Farmer.findOne({ mobileNumber });
                break;
            case 'secretary':
                user = await Secretary.findOne({ mobileNumber });
                break;
            case 'admin':
                user = await Admin.findOne({ mobileNumber });
                break;
            default:
                return res.status(400).json({ message: 'Invalid user type.' });
        }

        if (user) {
            req.session.userId = user._id;
            req.session.mobileNumber = user.mobileNumber;
            return res.json({ redirectUrl: `/api/${userType}/home` });
        } else {
            return res.json({ redirectUrl: `/api/${userType}/signup` });
        }     
    } else {
        return res.status(400).json({ message: 'Invalid OTP' });
    }
});

module.exports = router;
