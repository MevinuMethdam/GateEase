const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY1);

exports.analyzeComplaint = async (req, res) => {
    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ error: "Complaint description is required" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const prompt = `
        Analyze the following apartment maintenance complaint in any language (including Sinhala or English).
        
        1. Categorize it strictly into one of these categories: "Plumbing", "Electrical", "Carpentry", "Cleaning", "HVAC", or "General".
        2. Determine the urgency level: "Low", "Medium", "High", or "Critical". (e.g., Burst pipes or fire risks are Critical. A fused bulb is Low/Medium).

        Complaint: "${description}"

        Return ONLY a valid JSON object with the keys "category" and "urgency". Do not include any other text, explanations, or markdown formatting (like \`\`\`json).
        Example: {"category": "Plumbing", "urgency": "Critical"}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

        const parsedData = JSON.parse(text);
        res.status(200).json(parsedData);

    } catch (error) {
        console.error("AI Categorization Error:", error);
        res.status(500).json({ error: "Failed to analyze complaint using AI." });
    }
};