const db = require('../config/db');
const crypto = require('crypto');

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

exports.createPass = async (req, res) => {
    const { resident_id, visitor_name, visit_date } = req.body;

    try {
        const pass_token = crypto.randomBytes(4).toString('hex').toUpperCase();

        await db.query(
            'INSERT INTO visitor_passes (resident_id, visitor_name, visit_date, pass_token, status) VALUES (?, ?, ?, ?, "Active")',
            [resident_id, visitor_name, visit_date, pass_token]
        );

        res.status(201).json({ message: 'Visitor Pass generated successfully!', pass_token });
    } catch (error) {
        console.error('Error creating visitor pass:', error);
        res.status(500).json({ message: 'Failed to create pass', error: error.message });
    }
};

exports.getResidentPasses = async (req, res) => {
    const { resident_id } = req.params;
    try {
        const [passes] = await db.query(
            'SELECT * FROM visitor_passes WHERE resident_id = ? ORDER BY visit_date DESC, created_at DESC',
            [resident_id]
        );
        res.status(200).json(passes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch passes', error: error.message });
    }
};

exports.verifyPass = async (req, res) => {
    const { pass_token } = req.body;

    try {
        const query = `
            SELECT vp.*, u.unit_number, usr.name as resident_name 
            FROM visitor_passes vp
            JOIN users usr ON vp.resident_id = usr.id
            JOIN units u ON usr.unit_no = u.unit_number
            WHERE vp.pass_token = ?
        `;
        const [passes] = await db.query(query, [pass_token]);

        if (passes.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid QR Code. Pass not found.' });
        }

        const pass = passes[0];

        if (pass.status === 'Used') {
            return res.status(400).json({ success: false, message: 'This pass has already been used!' });
        }

        if (pass.status === 'Expired') {
            return res.status(400).json({ success: false, message: 'This pass has expired.' });
        }

        await db.query('UPDATE visitor_passes SET status = "Used" WHERE id = ?', [pass.id]);

        await db.query(
            'INSERT INTO visitors (resident_id, visitor_name, vehicle_number, approval_status) VALUES (?, ?, ?, "approved")',
            [pass.resident_id, pass.visitor_name, 'VIP QR Pass']
        );
        try {
            const notifMsg = `Your VIP guest "${pass.visitor_name}" has successfully checked in at the main gate using the QR Pass.`;
            await db.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES (?, "VIP Guest Arrived", ?, "maintenance")',
                [pass.resident_id, notifMsg]
            );
        } catch (notifErr) {
            console.error("Failed to notify resident about VIP entry:", notifErr);
        }

        res.status(200).json({
            success: true,
            message: 'Pass Verified!',
            visitor: pass.visitor_name,
            unit: pass.unit_number,
            resident: pass.resident_name
        });

    } catch (error) {
        console.error('Error verifying pass:', error);
        res.status(500).json({ success: false, message: 'Failed to verify pass', error: error.message });
    }
};