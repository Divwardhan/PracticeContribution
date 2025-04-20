import jwt from 'jsonwebtoken';

// Injects db into req
function withDB(dbInstance) {
    return function (req, res, next) {
        req.db = dbInstance;
        next();
    };
}

async function middleware(req, res, next) {
    const token = req.headers.token;
    try {
        if (!token) return res.status(401).json({ error: "Please login to continue" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded)
        if (!decoded) return res.status(401).json({ error: "Invalid token" });

        const [user] = await req.db.query("SELECT * FROM members WHERE member_id = ?", [decoded.id]);
        if (user.length === 0) return res.status(401).json({ error: "Invalid token" });
        req.body.requested_by = user[0].member_type
        req.body.appointed_by_id = user[0].member_id
        req.id = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
}

async function guardmiddleware(req, res, next) {
    const token = req.headers.token;
    try {
        if (!token) return res.status(401).json({ error: "Please login to continue" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(401).json({ error: "Invalid token" });

        const [user] = await req.db.query("SELECT * FROM guards WHERE gid = ?", [decoded.id]);
        if (user.length === 0) return res.status(401).json({ error: "Invalid token" });

        req.id = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
}

export { middleware, guardmiddleware, withDB };
