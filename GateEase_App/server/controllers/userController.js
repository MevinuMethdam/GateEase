const db = require('../config/db');
const bcrypt = require('bcrypt'); // Password ලොක් කරන Package එක

// ඔක්කොම Residents ලා ගන්න
exports.getAllResidents = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, phone FROM users WHERE role = "resident"');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database query failed', error });
    }
};

// අලුත් Resident කෙනෙක් දාන්න
exports.addResident = async (req, res) => {
    const { name, email, password, phone, unit_id, status } = req.body;

    try {
        // Email එක කලින් තියෙනවද බලනවා
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already exists!' });
        }

        // Password එක Encrypt කිරීම (Security Requirement)
        const hashedPassword = await bcrypt.hash(password, 10);

        // User ව Database එකට දානවා
        const [userResult] = await db.query(
            'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, 'resident', phone]
        );

        const userId = userResult.insertId;

        // Unit එකක් තෝරලා තියෙනවා නම්, ඒ Unit එකට මේ User ව Assign කරනවා
        if (unit_id) {
            await db.query(
                'UPDATE units SET owner_id = ?, status = ? WHERE id = ?',
                [userId, status, unit_id]
            );
        }

        res.status(201).json({ message: 'Resident registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add resident', error });
    }
};

// 1. Resident ගේ විස්තර වෙනස් කිරීම (Edit)
exports.updateResident = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    try {
        await db.query(
            'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
            [name, email, phone, id]
        );
        res.status(200).json({ message: 'Resident details updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update resident', error });
    }
};

// 2. Resident ව අයින් කිරීම (Soft Delete)
exports.deleteResident = async (req, res) => {
    const { id } = req.params;
    try {
        // මෙතනදි අපි DELETE කරන්නේ නෑ, is_deleted = TRUE කරනවා විතරයි (Soft Delete)
        await db.query('UPDATE users SET is_deleted = TRUE WHERE id = ?', [id]);

        // ඒ Resident ඉන්න Unit එක ආයෙත් "vacant" (හිස්) කරනවා
        await db.query('UPDATE units SET owner_id = NULL, occupancy_status = "vacant" WHERE owner_id = ?', [id]);

        res.status(200).json({ message: 'Resident removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete resident', error });
    }
};