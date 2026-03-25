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

// Routes Import කරන්න
const unitRoutes = require('./routes/unitRoutes'); // <-- මෙන්න මේක අලුතින් එකතු කළා
const notificationRoutes = require('./routes/notificationRoutes'); // උඩින්ම දාන්න

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes Use කරන්න
app.use('/api/units', unitRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);// <-- මෙන්න මේ පේළිය එකතු කළා
app.use('/api/notifications', notificationRoutes); // Routes ටික තියෙන තැනින් දාන්න
app.use('/api/profile', require('./routes/profileRoutes'));
// මේක අනිත් routes තියෙන තැනට දාන්න
app.get('/', (req, res) => {
    res.send('GateEase API is Running... 🚀');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});