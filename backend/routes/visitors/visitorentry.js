import { Router } from "express";
import {middleware} from '../../middleware/islogin.js'
import dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const visitorEntry = (db)=>{
    const router = Router()

    router.post('/entry', async (req, res) => {
        const { visitor_name, visitor_phone, visiting_whom, intime, visitor_type } = req.body;

        try {
            if (!visitor_name || !visitor_phone || !visiting_whom || !intime || !visitor_type) {
                return res.status(400).json({ message: "Invalid request data" });
            }
    
            const [result] = await db.query(
                "INSERT INTO visitors (visitor_name, visitor_phone, visiting_whom, intime,  visitor_type) VALUES (?, ?, ?, ?, ?)",
                [visitor_name, visitor_phone, visiting_whom, intime,  visitor_type]
            );
    
            res.status(200).json({
                message: "Visitor entry made successfully",
                visitorId: result.insertId
            });
    
        } catch (error) {
            console.error("Error inserting visitor:", error);
            res.status(500).json({
                message: "Error while making an entry"
            });
        }
    });
    
    router.post("/post_image" ,async(req,res)=>{
        const {visitorId , image} = req.body
        try{
            if(!visitorId || !image){
                return res.status(400).json({message: "Invalid request data"})
            }
            const [result] = await db.query("INSERT INTO visitor_photos (visid , picture_url) VALUES (?,?)" , [visitorId , image])
            res.status(200).json({message: "Image uploaded successfully"})
        }
        catch(error){
            console.error("Error inserting image:", error);
            res.status(500).json({
                message: "Error while uploading image"
            });
        }
    })
    router.post("/post-carnumber" , async(req,res)=>{
        const {visitorId , carnumber} = req.body
        try{
            if(!visitorId || !carnumber){
                return res.status(400).json({message: "Invalid request data"})
            }
            const [result] = await db.query("INSERT INTO visitor_vehicles (vis_id, license_plate) VALUES (?,?)" , [visitorId , carnumber])
            res.status(200).json({message: "Car number uploaded successfully"})
        }
        catch(error){
            console.error("Error inserting image:", error);
            res.status(500).json({
                message: "Error while uploading image"
            });
        }
    })
    return router
}
export default visitorEntry


