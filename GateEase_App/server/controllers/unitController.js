const db = require('../config/db');

// 1. ඔක්කොම Units ටික ගන්න (Get All Units)
exports.getAllUnits = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM units');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database query failed', error });
    }
};

// 2. අලුත් Unit එකක් හදන්න (Add New Unit)
exports.addUnit = async (req, res) => {
    const { unit_number, floor_number, square_feet, status } = req.body;

    try {
        // Unit Number එක කලින් තියෙනවද බලනවා
        const [existing] = await db.query('SELECT * FROM units WHERE unit_number = ?', [unit_number]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Unit number already exists!' });
        }

        // Database එකට insert කරනවා
        await db.query(
            'INSERT INTO units (unit_number, floor_number, square_feet, status) VALUES (?, ?, ?, ?)',
            [unit_number, floor_number, square_feet, status || 'vacant']
        );

        res.status(201).json({ message: 'Unit added successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add unit', error });
    }
};

// Unit එකක විස්තර වෙනස් කිරීම
exports.updateUnit = async (req, res) => {
    const { id } = req.params;
    const { unit_number, floor_number, square_feet, status } = req.body;
    try {
        await db.query(
            'UPDATE units SET unit_number = ?, floor_number = ?, square_feet = ?, status = ? WHERE id = ?',
            [unit_number, floor_number, square_feet, status, id]
        );
        res.status(200).json({ message: 'Unit updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update unit', error });
    }
};

// Unit එකක් අයින් කිරීම
exports.deleteUnit = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM units WHERE id = ?', [id]);
        res.status(200).json({ message: 'Unit removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete unit (Check if it has existing records)', error });
    }
};