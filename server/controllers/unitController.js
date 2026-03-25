const db = require('../config/db');

exports.getAllUnits = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM units');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database query failed', error });
    }
};

exports.addUnit = async (req, res) => {
    // 🌟 NEW: Added 'category' to destructuring
    const { unit_number, floor_number, square_feet, status, category } = req.body;

    try {
        const [existing] = await db.query('SELECT * FROM units WHERE unit_number = ?', [unit_number]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Unit number already exists!' });
        }

        // 🌟 NEW: Added 'category' to the INSERT query
        await db.query(
            'INSERT INTO units (unit_number, floor_number, square_feet, status, category) VALUES (?, ?, ?, ?, ?)',
            [unit_number, floor_number, square_feet, status || 'vacant', category || 'Not Categorized']
        );

        res.status(201).json({ message: 'Unit added successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add unit', error });
    }
};

exports.updateUnit = async (req, res) => {
    const { id } = req.params;
    // 🌟 NEW: Added 'category' to destructuring
    const { unit_number, floor_number, square_feet, status, category } = req.body;

    try {
        // 🌟 NEW: Added 'category' to the UPDATE query
        await db.query(
            'UPDATE units SET unit_number = ?, floor_number = ?, square_feet = ?, status = ?, category = ? WHERE id = ?',
            [unit_number, floor_number, square_feet, status, category, id]
        );
        res.status(200).json({ message: 'Unit updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update unit', error });
    }
};

exports.deleteUnit = async (req, res) => {
    const unitId = req.params.id;

    try {
        try {
            await db.query(`DELETE FROM payments WHERE unit_id = ?`, [unitId]);
        } catch (paymentErr) {}

        try {
            const [unitInfo] = await db.query('SELECT unit_number FROM units WHERE id = ?', [unitId]);
            if(unitInfo.length > 0) {
                await db.query(`UPDATE users SET unit_no = NULL WHERE unit_no = ?`, [unitInfo[0].unit_number]);
            }
        } catch (updateErr) {}

        const [result] = await db.query(`DELETE FROM units WHERE id = ?`, [unitId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        res.status(200).json({ message: 'Unit deleted successfully!' });
    } catch (error) {
        console.error("Error deleting unit:", error);
        res.status(500).json({ message: "Server Error: Could not delete unit." });
    }
};