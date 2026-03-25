const db = require('../config/db');

// 1. ඔක්කොම Visitors ලාගේ විස්තර ගන්න
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

// 2. අලුත් අමුත්තෙක් ගේට්ටුවෙන් ආවම දත්ත ඇතුළත් කරන්න (සහ Notification යවන්න)
exports.addVisitor = async (req, res) => {
    const { resident_id, visitor_name, vehicle_number } = req.body;
    try {
        // 1. Visitor ව Database එකට සේව් කරනවා
        await db.query(
            'INSERT INTO visitors (resident_id, visitor_name, vehicle_number, approval_status) VALUES (?, ?, ?, "pending")',
            [resident_id, visitor_name, vehicle_number]
        );

        // 2. Resident ට Notification එකක් යවනවා
        if (resident_id) {
            const safeVisitorName = visitor_name ? String(visitor_name) : 'A visitor';
            const vehicleInfo = vehicle_number ? ` (Vehicle: ${vehicle_number})` : '';

            const notificationTitle = 'New Visitor Arrival';
            const notificationMessage = `${safeVisitorName}${vehicleInfo} is at the gate waiting for your approval.`;

            // මෙතන "general" වෙනුවට Database එක දන්න "maintenance" කියන වචනේ දැම්මා
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

// 3. Resident විසින් අමුත්තාව Approve හෝ Reject කිරීම (Admin Notification එකත් එක්කම)
exports.updateApprovalStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    try {
        // Status එක Database එකේ අප්ඩේට් කරනවා
        await db.query(
            'UPDATE visitors SET approval_status = ? WHERE id = ?',
            [status, id]
        );

        // ⬇️ මෙන්න අලුතින් එකතු කරපු ADMIN NOTIFICATION කෑල්ල ⬇️
        try {
            // අමුත්තාගේ සහ Resident ගේ විස්තර ගන්නවා
            const [visitorInfo] = await db.query(`
                SELECT v.visitor_name, u.name as resident_name 
                FROM visitors v 
                JOIN users u ON v.resident_id = u.id 
                WHERE v.id = ?
            `, [id]);

            if (visitorInfo.length > 0) {
                const { visitor_name, resident_name } = visitorInfo[0];

                // 🛠️ වෙනස මෙතනයි: LOWER(role) පාවිච්චි කළා, එතකොට 'Admin', 'ADMIN', 'System Admin' ඔක්කොම අල්ලනවා
                const [admins] = await db.query('SELECT id FROM users WHERE LOWER(role) = "admin" OR LOWER(role) = "system admin" LIMIT 1');

                if (admins.length > 0) {
                    const adminId = admins[0].id;
                    const safeStatus = status.charAt(0).toUpperCase() + status.slice(1); // 'Approved' හෝ 'Rejected' විදියට අකුරු හදනවා

                    const adminTitle = `Gate Entry ${safeStatus}`;
                    const adminMessage = `Resident ${resident_name} has ${status} the gate entry for visitor "${visitor_name}".`;

                    // Admin ගේ Database එකට Notification එක දානවා
                    await db.query(
                        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "maintenance")',
                        [adminId, adminTitle, adminMessage]
                    );
                    console.log(`✅ Admin (ID: ${adminId}) notified about gate approval.`); // Terminal එකට Print කරනවා
                } else {
                    console.log("❌ WARNING: No Admin user found in the database to send the notification!"); // Admin ව හොයාගන්න බැරි වුණොත් මේක වැටෙයි
                }
            }
        } catch (notifError) {
            console.error('Failed to send admin notification for gate approval:', notifError);
            // Notification එක යවන්න බැරි වුණත් Status Update එක සාර්ථක නිසා Error එකක් යවන්නේ නෑ
        }
        // ⬆️ ADMIN NOTIFICATION කෑල්ල ඉවරයි ⬆️

        res.status(200).json({ message: `Visitor ${status} successfully!` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update status', error });
    }
};

// 4. Resident කෙනෙකුගේ අමුත්තන් පමණක් ලබා ගැනීම
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

// 5. අමුත්තෙකුගේ වාර්තාවක් වෙනස් කිරීම (Edit)
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

// 6. අමුත්තෙකුගේ වාර්තාවක් මැකීම (Delete)
exports.deleteVisitor = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM visitors WHERE id = ?', [id]);
        res.status(200).json({ message: 'Visitor removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete visitor', error });
    }
};