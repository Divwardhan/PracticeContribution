import { Router } from "express";
import { middleware, guardmiddleware, withDB } from '../middleware/islogin.js';

const appointmentRouter = (db) => {
    const router = Router();

    router.use(withDB(db));

    router.get('/', guardmiddleware, async (req, res) => {
        console.log(req, res);
        try {
            const [appointments] = await req.db.query("SELECT * FROM appointments");
            res.status(200).json(appointments);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error fetching appointments" });
        }
    });
    

    router.post('/make-appointment', middleware, async (req, res) => {
        try {
            const { visitor_name, visitor_phone, requested_by, appointed_by_id } = req.body;
    
            const appointment_date = new Date().toISOString().split('T')[0];
    
            const [result] = await req.db.query(
                "INSERT INTO appointments (requested_by, appointment_date, visitor_phone, visitor_name, appointed_by_id) VALUES (?, ?, ?, ?, ?)",
                [requested_by, appointment_date, visitor_phone, visitor_name, appointed_by_id]
            );
    
            if (result.affectedRows > 0) {
                return res.status(201).json({ message: "Appointment created successfully" });
            } else {
                return res.status(400).json({ message: "Failed to create appointment" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error creating appointment" });
        }
    });
    router.post("/accept-appointment", guardmiddleware, async (req, res) => {
        try {
            const { appointment_id } = req.body;
    
            const [appointmentRows] = await req.db.query(
                "SELECT * FROM appointments WHERE appointment_id = ?",
                [appointment_id]
            );
    
            if (appointmentRows.length === 0) {
                return res.status(404).json({ message: "Appointment not found" });
            }
    
            const appointment = appointmentRows[0];
    
            await req.db.query(
                "UPDATE appointments SET status = 'accepted' WHERE appointment_id = ?",
                [appointment_id]
            );
    
            const intime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Current datetime
    
            await req.db.query(
                `INSERT INTO visitors (
                    visitor_name,
                    visitor_phone,
                    intime,
                    visitor_type,
                    appointment_id
                ) VALUES (?, ?, ?, ?, ?)`,
                [
                    appointment.visitor_name,
                    appointment.visitor_phone,
                    intime,
                    appointment.requested_by,
                    appointment.appointment_id
                ]
            );
    
            res.status(200).json({ message: "Appointment accepted and visitor added" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
    
    

    return router;
};

export default appointmentRouter;
