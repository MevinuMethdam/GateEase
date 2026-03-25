const db = require('../config/db');

exports.getAllVisitors = async (req, res) => {
    try {
        const query = `
            SELECT v.*, u.name as resident_name, u.phone as resident_phone 
            FROM visitors v 
            JOIN users u ON v.resident_id = u.id 
            ORDER BY v.entry_time DESC
        `;
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database query failed', error });
    }
};

exports.addVisitor = async (req, res) => {
    const { resident_id, visitor_name, vehicle_number } = req.body;
    try {
        await db.query(
            'INSERT INTO visitors (resident_id, visitor_name, vehicle_number, approval_status) VALUES (?, ?, ?, "pending")',
            [resident_id, visitor_name, vehicle_number]
        );

        if (resident_id) {
            const safeVisitorName = visitor_name ? String(visitor_name) : 'A visitor';
            const vehicleInfo = vehicle_number ? ` (Vehicle: ${vehicle_number})` : '';

            const notificationTitle = 'New Visitor Arrival';
            const notificationMessage = `${safeVisitorName}${vehicleInfo} is at the gate waiting for your approval.`;

            await db.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "maintenance")',
                [resident_id, notificationTitle, notificationMessage]
            );
        }

        res.status(201).json({ message: 'Visitor logged successfully! Waiting for approval.' });
    } catch (error) {
        console.error('Add Visitor Error:', error);
        res.status(500).json({ message: 'Failed to log visitor', error: error.message });
    }
};

exports.updateApprovalStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query(
            'UPDATE visitors SET approval_status = ? WHERE id = ?',
            [status, id]
        );

        try {
            const [visitorInfo] = await db.query(`
                SELECT v.visitor_name, u.name as resident_name 
                FROM visitors v 
                JOIN users u ON v.resident_id = u.id 
                WHERE v.id = ?
            `, [id]);

            if (visitorInfo.length > 0) {
                const { visitor_name, resident_name } = visitorInfo[0];
                const [admins] = await db.query('SELECT id FROM users WHERE LOWER(role) = "admin" OR LOWER(role) = "system admin" LIMIT 1');

                if (admins.length > 0) {
                    const adminId = admins[0].id;
                    const safeStatus = status.charAt(0).toUpperCase() + status.slice(1);

                    const adminTitle = `Gate Entry ${safeStatus}`;
                    const adminMessage = `Resident ${resident_name} has ${status} the gate entry for visitor "${visitor_name}".`;

                    await db.query(
                        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "maintenance")',
                        [adminId, adminTitle, adminMessage]
                    );
                    console.log(`✅ Admin (ID: ${adminId}) notified about gate approval.`);
                } else {
                    console.log("❌ WARNING: No Admin user found in the database to send the notification!");
                }
            }
        } catch (notifError) {
            console.error('Failed to send admin notification for gate approval:', notifError);
        }

        res.status(200).json({ message: `Visitor ${status} successfully!` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update status', error });
    }
};

exports.getResidentVisitors = async (req, res) => {
    const { resident_id } = req.params;
    try {
        const query = `
            SELECT * FROM visitors 
            WHERE resident_id = ? 
            ORDER BY entry_time DESC
        `;
        const [rows] = await db.query(query, [resident_id]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch resident visitors', error });
    }
};

exports.updateVisitor = async (req, res) => {
    const { id } = req.params;
    const { visitor_name, vehicle_number, approval_status } = req.body;
    try {
        await db.query(
            'UPDATE visitors SET visitor_name = ?, vehicle_number = ?, approval_status = ? WHERE id = ?',
            [visitor_name, vehicle_number, approval_status, id]
        );
        res.status(200).json({ message: 'Visitor updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update visitor', error });
    }
};

exports.deleteVisitor = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM visitors WHERE id = ?', [id]);
        res.status(200).json({ message: 'Visitor removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete visitor', error });
    }
};