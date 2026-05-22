const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getAllResidents = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, phone, unit_no, role, status, created_at FROM users WHERE role IN ("resident", "maintenance")');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database query failed', error });
    }
};

exports.addResident = async (req, res) => {
    const { name, email, password, phone, unit_id, status, role, nic, emergency_contact, vehicle_number, agreement_end_date } = req.body;

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

        await db.query(
            'INSERT INTO users (name, email, password, role, phone, unit_no, nic, emergency_contact, vehicle_number, agreement_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, userRole, phone, unitNo, nic || null, emergency_contact || null, vehicle_number || null, agreement_end_date || null]
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

        await db.query('DELETE FROM bookings WHERE resident_id = ?', [id]).catch(() => {});
        await db.query('DELETE FROM payments WHERE resident_id = ?', [id]).catch(() => {});
        await db.query('DELETE FROM visitors WHERE resident_id = ?', [id]).catch(() => {});
        await db.query('DELETE FROM complaints WHERE resident_id = ?', [id]).catch(() => {});
        await db.query('DELETE FROM notifications WHERE user_id = ?', [id]).catch(() => {});

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

exports.deactivateUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [userInfo] = await db.query('SELECT unit_no FROM users WHERE id = ?', [id]);
        const unitNo = userInfo.length > 0 ? userInfo[0].unit_no : null;
        await db.query('UPDATE users SET status = "inactive" WHERE id = ?', [id]);

        if (unitNo) {
            await db.query('UPDATE units SET status = "locked" WHERE unit_number = ?', [unitNo]);
        }

        res.status(200).json({ message: 'User deactivated successfully!' });
    } catch (error) {
        console.error('Error deactivating user:', error);
        res.status(500).json({ message: 'Failed to deactivate user', error });
    }
};

exports.activateUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [userInfo] = await db.query('SELECT unit_no FROM users WHERE id = ?', [id]);
        const unitNo = userInfo.length > 0 ? userInfo[0].unit_no : null;
        await db.query('UPDATE users SET status = "active" WHERE id = ?', [id]);

        if (unitNo) {
            await db.query('UPDATE units SET status = "rented" WHERE unit_number = ?', [unitNo]);
        }

        res.status(200).json({ message: 'User reactivated successfully!' });
    } catch (error) {
        console.error('Error reactivating user:', error);
        res.status(500).json({ message: 'Failed to reactivate user', error });
    }
};

exports.changePassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide both current and new passwords.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.status(200).json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Failed to update password' });
    }
};