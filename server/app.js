import express from "express";
import biomesApi from "./api/biomes.js";

const app = express();
const PORT = 8000;

app.use("/api/biomes", biomesApi);

// statické soubory (textury)
app.use("/assets", express.static("../assets"));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});