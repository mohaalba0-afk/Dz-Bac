require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("DZ-Mark Backend يعمل بنجاح");
});

app.post("/generate-image", async (req, res) => {

  const prompt = req.body.prompt;

  if (!prompt) {
    return res.status(400).json({
      error: "Prompt is required"
    });
  }

  try {

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        inputs: prompt
      },
      {
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const image = Buffer.from(response.data, "binary").toString("base64");

    res.json({
      image: image
    });

  } catch (err) {

    console.log(err.response?.data || err.message);

    res.status(500).json({
      error: "Generation failed"
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server Started");
});