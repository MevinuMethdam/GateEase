require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const roomRoutes = require('./routes/roomRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const aiRoutes = require('./routes/aiRoutes');

const unitRoutes = require('./routes/unitRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/units', unitRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/rooms', roomRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    res.send('GateEase API is Running... 🚀');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});