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
    // 1. طلب توليد الصورة من OpenAI DALL-E 3
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json", // الحصول على الصورة مباشرة كـ Base64
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 2. استخراج الصورة بصيغة Base64
    const imageBase64 = response.data.data[0].b64_json;

    // 3. إرسال الصورة إلى التطبيق بنفس الهيكلية لضمان عمل البلوكات الحالية
    res.json({ image: imageBase64 });
  } catch (err) {
    const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
  console.log(err.response?.status);
console.log(err.response?.data);
    res.status(500).json({ error: "Generation failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server Started");
});