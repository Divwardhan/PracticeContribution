import twilio from "twilio";
import dotenv from "dotenv";
import path from "path"
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const otpStore = new Map(); 


const allowedPhoneNumbers = [
    "+911111111111",
    "+911111111112",  
    "+1112233445",  
  ];

export async function sendOtp(phoneNumber){
    console.log("Sending OTP to:", phoneNumber);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const message = `Your OTP is ${otp}`;
   
        
        try {
            if (!allowedPhoneNumbers.includes(phoneNumber)) {
                console.log("Phone Number not authorised for OTP in otp sending ");
                return {msg : "Phone Number not authorised for OTP in otp sending " , bool: false} 
              }
          await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
          });
  
          otpStore.set(phoneNumber, otp);
          setTimeout(() => otpStore.delete(phoneNumber), 5 * 60 * 1000);
  
          return {msg:"OTP Sent Successfully! 5 minutes to expire" , bool: true};
        } catch (err) {
            console.error(err);
            return {msg:"Error sending OTP" , bool: false};
        }
};
export async function verifyOtp(phoneNumber, otp){
    const validOtp = otpStore.get(phoneNumber);
    console.log("Verifying OTP:", otp, "for phone:", phoneNumber, "Stored OTP:", validOtp);

    if (validOtp === otp) {
        otpStore.delete(phoneNumber);
        return {msg:"OTP verified successfully!" , bool: true};
    } else {
        return {msg : "Invalid or expired OTP." , bool: false};
    }
}


