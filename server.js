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
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // 1. طلب التوليد باستخدام نموذج dall-e-2 المتوافق مع كافة الحسابات
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        model: "dall-e-2",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 2. الحصول على رابط الصورة المباشر
    const imageUrl = response.data.data[0].url;

    // 3. تحميل الصورة وتحويلها إلى Base64
    const imageBuffer = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBase64 = Buffer.from(imageBuffer.data, "binary").toString("base64");

    // 4. إرسال الصورة المجهزة لتطبيقك
    res.json({ image: imageBase64 });
  } catch (err) {
    const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    console.log("OpenAI Error:", errorMsg);
    res.status(500).json({ error: "Generation failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server Started");
});