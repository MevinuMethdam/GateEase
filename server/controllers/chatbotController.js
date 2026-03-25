const { GoogleGenerativeAI } = require('@google/generative-ai');

// .env එකේ තියෙන API Key එකෙන් Gemini එක Initialize කරනවා
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handleChat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // අපි පාවිච්චි කරන්නේ අලුත්ම gemini-1.5-flash මොඩල් එක
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // AI එකට GateEase Assistant විදියට වැඩ කරන්න දෙන උපදෙස් (System Prompt)
        const prompt = `
        You are the official 24/7 Virtual Assistant for "GateEase", a premium apartment management system.
        Your tone should be helpful, polite, professional, and concise.
        You assist residents with general questions about the apartment rules, using the system (Payments, Maintenance, Bookings, Visitor approvals).
        
        Important: If the user asks for their specific bill amount, database records, or personal info, politely inform them that you are currently a Beta AI and they should check the respective tabs (like 'My Bills' or 'Bookings') in their Resident Dashboard for accurate details.
        
        Resident's Message: "${message}"
        `;

        // AI එකෙන් උත්තරේ ගන්නවා
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // උත්තරේ Frontend එකට යවනවා
        res.status(200).json({ reply: text });

    } catch (error) {
        console.error("Gemini AI Error:", error);
        res.status(500).json({ error: "Failed to process chat request.", details: error.message });
    }
};