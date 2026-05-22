const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getUserProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT id, name, email, phone, role, status, emergency_contact, unit_no AS unit_number 
            FROM users 
            WHERE id = ?
        `;
        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        let userProfile = rows[0];

        if (userProfile.emergency_contact && typeof userProfile.emergency_contact === 'string') {
            const contactStr = userProfile.emergency_contact.trim();
            if (contactStr.startsWith('{') || contactStr.startsWith('[')) {
                try {
                    userProfile.emergency_contact = JSON.parse(contactStr);
                } catch (e) {
                    console.error("Error parsing emergency contact:", e);
                }
            }
        }

        res.status(200).json(userProfile);
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
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
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