// backend/routes/guardAuth.js

import { Router } from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { sendOtp , verifyOtp } from "../../middleware/otp.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const guardAuth = (db) => {
    const router = Router();

    router.post("/entry-otp-send", async (req, res) => {
        const {gid , phone} = req.body
        try{
            const [found] = await db.query("SELECT * FROM guards WHERE gid = ? AND gphone = ?", [gid , phone])

            if(found.length === 0){
                return res.status(404).json({message: "Guard not found"})
            }   
            const message =await sendOtp("+91" + phone)
            if(!message.bool){
                return res.status(500).json({message: message.msg , bool :"fnbhe"})
            }
            
            res.status(200).json({message: message.msg})

        }
        catch(error){
            console.log(error)
            res.status(500).json({message: "Internal server error"})
        }
        
    });

    router.post("/entry-otp-verify", async (req, res) => {
        const { otp, gid, phone } = req.body;
    
        try {
            if (!otp || !gid || !phone) {
                return res.status(400).json({ message: "Invalid request data" });
            }
    
            const message = await verifyOtp('+91' + phone, otp);
            if (!message.bool) {
                return res.status(500).json({ message: message.msg });
            }
    
            // Insert into entry_log table after successful OTP verification
            const currentDate = new Date();
            const date_of_entry = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD
            const time_of_entry = currentDate.toTimeString().slice(0, 8); // HH:MM:SS
    
            await db.query(
                "INSERT INTO guardentry (gid, date_of_entry, time_of_entry) VALUES (?, ?, ?)",
                [gid, date_of_entry, time_of_entry]
            );
            const token = jwt.sign({ id: gid }, process.env.JWT_SECRET, { expiresIn: "12h" });
            const gjson = {
                gid,phone,token
            }
    
            res.status(200).json({ message: "OTP verified and entry logged successfully!" , gjson});
    
        } catch (error) {
            console.log("❌ Error in entry-otp-verify:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
    router.post("/checkout", async (req, res) => {
        const { gid } = req.body;
    
        try {
            if (!gid) {
                return res.status(400).json({ message: "Guard ID is required" });
            }
    
            const [rows] = await db.query(
                "SELECT * FROM guardentry WHERE gid = ? AND time_of_checkout IS NULL ORDER BY entry_id DESC LIMIT 1",
                [gid]
            );
    
            if (rows.length === 0) {
                return res.status(404).json({ message: "No active entry found for checkout" });
            }
    
            const currentTime = new Date().toTimeString().slice(0, 8); 
    
            await db.query(
                "UPDATE guardentry SET time_of_checkout = ? WHERE entry_id = ?",
                [currentTime, rows[0].entry_id]
            );
    
            res.status(200).json({ message: "Checkout time updated successfully!" });
    
        } catch (error) {
            console.error("❌ Error in checkout endpoint:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
    

    return router;
};

export default guardAuth;
