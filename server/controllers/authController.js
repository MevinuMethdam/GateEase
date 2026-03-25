const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found!' });

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials!' });
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            message: 'Login successful',
            token,
            role: user.role,
            name: user.name
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
exports.setupAdmin = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.query(
            'INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['System Admin', 'admin@gateease.com', hashedPassword, 'admin']
        );
        res.send('✅ Admin account generated! <br> Email: <b>admin@gateease.com</b> <br> Password: <b>admin123</b>');
    } catch (error) {
        res.status(500).send('Error creating admin');
    }
};