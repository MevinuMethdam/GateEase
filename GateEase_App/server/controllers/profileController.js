const db = require('../config/db');

// 1. User ගේ විස්තර සහ Unit එක ලබා ගැනීම (ආරක්ෂිත Query එක)
exports.getUserProfile = async (req, res) => {
    const { id } = req.params;
    try {
        // tenant_id සහ role අයින් කරලා, අනිවාර්යයෙන් තියෙන columns විතරක් ගත්තා
        const query = `
            SELECT u.id, u.name, u.email, u.phone, un.unit_number 
            FROM users u 
            LEFT JOIN units un ON u.id = un.owner_id 
            WHERE u.id = ?
        `;
        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Profile Fetch Error:', error); // Error එක Terminal එකේ බලාගන්න
        res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
};

// 2. Personal Details (Name, Phone, Email) Update කිරීම
exports.updateProfile = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    try {
        await db.query(
            'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
            [name, email, phone, id]
        );
        res.status(200).json({ message: 'Profile updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error });
    }
};

// 3. Password එක Update කිරීම (Security)
exports.updatePassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    try {
        // (මෙහිදී ඔබ bcrypt භාවිතා කරනවා නම් password එක hash කර save කරන්න. දැනට සාමාන්‍ය update එකක් යොදා ඇත)
        await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [newPassword, id]
        );
        res.status(200).json({ message: 'Password changed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update password', error });
    }
};