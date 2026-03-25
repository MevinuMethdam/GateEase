const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getAllResidents = async (req, res) => {
    try {
        // 🌟 UPDATE: Added 'status' to the SELECT query so the frontend Deactivate badge works
        const [rows] = await db.query('SELECT id, name, email, phone, unit_no, role, status, created_at FROM users WHERE role IN ("resident", "maintenance")');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database query failed', error });
    }
};

exports.addResident = async (req, res) => {
    // 🌟 NEW: Added nic, emergency_contact, vehicle_number to req.body
    const { name, email, password, phone, unit_id, status, role, nic, emergency_contact, vehicle_number } = req.body;

    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already exists!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'resident';

        let unitNo = null;

        if (unit_id && userRole === 'resident') {
            const [unitInfo] = await db.query('SELECT unit_number FROM units WHERE id = ?', [unit_id]);
            if (unitInfo.length > 0) {
                unitNo = unitInfo[0].unit_number;
            }
        }

        // 🌟 NEW: Updated INSERT query to include the 3 new fields
        await db.query(
            'INSERT INTO users (name, email, password, role, phone, unit_no, nic, emergency_contact, vehicle_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, userRole, phone, unitNo, nic || null, emergency_contact || null, vehicle_number || null]
        );

        if (unit_id && userRole === 'resident') {
            await db.query(
                'UPDATE units SET status = ? WHERE id = ?',
                [status, unit_id]
            );
        }

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add user', error });
    }
};

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

exports.deleteResident = async (req, res) => {
    const { id } = req.params;
    try {
        const [userInfo] = await db.query('SELECT unit_no FROM users WHERE id = ?', [id]);
        const unitNo = userInfo.length > 0 ? userInfo[0].unit_no : null;

        // 🌟 NEW: Delete all child records first to prevent Foreign Key constraint errors
        await db.query('DELETE FROM bookings WHERE resident_id = ?', [id]).catch(() => {});
        await db.query('DELETE FROM payments WHERE resident_id = ?', [id]).catch(() => {});
        await db.query('DELETE FROM visitors WHERE resident_id = ?', [id]).catch(() => {});
        await db.query('DELETE FROM complaints WHERE resident_id = ?', [id]).catch(() => {});
        await db.query('DELETE FROM notifications WHERE user_id = ?', [id]).catch(() => {});

        // Now delete the user
        await db.query('DELETE FROM users WHERE id = ?', [id]);

        if (unitNo) {
            await db.query('UPDATE units SET status = "vacant" WHERE unit_number = ?', [unitNo]);
        }

        res.status(200).json({ message: 'User removed successfully!' });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: 'Failed to delete user', error });
    }
};

// 🌟 NEW: Function to Deactivate User (Keep history but block access and free up unit)
exports.deactivateUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Find user's unit first
        const [userInfo] = await db.query('SELECT unit_no FROM users WHERE id = ?', [id]);
        const unitNo = userInfo.length > 0 ? userInfo[0].unit_no : null;

        // Update user status and remove their unit assignment
        await db.query('UPDATE users SET status = "inactive", unit_no = NULL WHERE id = ?', [id]);

        // Set their previous unit to vacant
        if (unitNo) {
            await db.query('UPDATE units SET status = "vacant" WHERE unit_number = ?', [unitNo]);
        }

        res.status(200).json({ message: 'User deactivated successfully!' });
    } catch (error) {
        console.error('Error deactivating user:', error);
        res.status(500).json({ message: 'Failed to deactivate user', error });
    }
};