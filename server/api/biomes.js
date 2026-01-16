// JavaScript soimport express from "express";
import sqlite3 from "sqlite3";

const router = express.Router();
const db = new sqlite3.Database("./db/biomes.sqlite");

router.get("/", (req, res) => {
    db.all("SELECT * FROM biomes", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

export default router;
