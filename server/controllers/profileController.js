const db = require('../config/db');

exports.getUserProfile = async (req, res) => {
    const { id } = req.params;
    try {
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
        console.error('Profile Fetch Error:', error);
        res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
    }
};

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

exports.updatePassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    try {

        await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [newPassword, id]
        );
        res.status(200).json({ message: 'Password changed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update password', error });
    }
};

exports.updateEmergencyContact = async (req, res) => {
    const userId = req.params.id;
    const { name, relationship, phone } = req.body;

    const emergencyContactStr = JSON.stringify({ name, relationship, phone });
    const sql = 'UPDATE users SET emergency_contact = ? WHERE id = ?';

    try {
        await db.query(sql, [emergencyContactStr, userId]);

        res.status(200).json({ message: 'Emergency contact updated successfully' });
    } catch (error) {
        console.error('Error updating emergency contact:', error);
        res.status(500).json({ message: 'Failed to update emergency contact' });
    }
};