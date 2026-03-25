const db = require('../config/db');

// 1. ඔක්කොම Complaints ටික ගන්න
exports.getAllComplaints = async (req, res) => {
    try {
        const query = `
            SELECT c.*, u.name as resident_name 
            FROM complaints c 
            JOIN users u ON c.resident_id = u.id 
            ORDER BY c.created_at DESC
        `;
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database query failed', error });
    }
};

// 2. අලුත් Complaint එකක් දාන්න (Admin Notification එකත් එක්කම)
exports.createComplaint = async (req, res) => {
    const { resident_id, title, description, priority } = req.body;
    try {
        await db.query(
            'INSERT INTO complaints (resident_id, title, description, priority, status) VALUES (?, ?, ?, ?, "open")',
            [resident_id, title, description, priority]
        );

        // ⬇️ මෙන්න අලුතින් එකතු කරපු ADMIN NOTIFICATION කෑල්ල ⬇️
        try {
            // Admin ගේ ID එක හොයාගන්නවා
            const [admins] = await db.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');

            // Resident ගේ නම ගන්නවා
            const [resident] = await db.query('SELECT name FROM users WHERE id = ?', [resident_id]);
            const residentName = resident.length > 0 ? resident[0].name : 'A Resident';

            if (admins.length > 0) {
                const adminId = admins[0].id;
                const adminTitle = 'New Maintenance Issue';
                const adminMessage = `${residentName} reported a new ${priority} priority issue: "${title}".`;

                // Admin ගේ Database එකට Notification එක දානවා
                await db.query(
                    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "maintenance")',
                    [adminId, adminTitle, adminMessage]
                );
            }
        } catch (notifError) {
            console.error('Failed to send admin notification:', notifError);
            // Notification එක යවන්න බැරි වුණත් Complaint එක සාර්ථක නිසා අපි Error එකක් යවන්නේ නෑ
        }
        // ⬆️ ADMIN NOTIFICATION කෑල්ල ඉවරයි ⬆️

        res.status(201).json({ message: 'Complaint lodged successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to lodge complaint', error });
    }
};

// 3. Complaint එකේ Status එක වෙනස් කරන්න (Open -> In Progress -> Resolved)
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query(
            'UPDATE complaints SET status = ? WHERE id = ?',
            [status, id]
        );
        res.status(200).json({ message: 'Status updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update status', error });
    }
};

exports.getResidentComplaints = async (req, res) => {
    const { resident_id } = req.params;
    try {
        const query = `
            SELECT * FROM complaints 
            WHERE resident_id = ? 
            ORDER BY created_at DESC
        `;
        const [rows] = await db.query(query, [resident_id]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch resident complaints', error });
    }
};

// පැමිණිල්ලක විස්තර වෙනස් කිරීම (Edit)
exports.updateComplaintDetails = async (req, res) => {
    const { id } = req.params;
    const { title, description, priority } = req.body;
    try {
        await db.query(
            'UPDATE complaints SET title = ?, description = ?, priority = ? WHERE id = ?',
            [title, description, priority, id]
        );
        res.status(200).json({ message: 'Complaint updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update complaint', error });
    }
};

// පැමිණිල්ලක් අයින් කිරීම (Delete)
exports.deleteComplaint = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM complaints WHERE id = ?', [id]);
        res.status(200).json({ message: 'Complaint removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete complaint', error });
    }
};

// Status update maduvudu mattu Notification kaluhisuvudu
exports.updateComplaintStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // 1. Database nalli complaint status update maduttade
        await db.query('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);

        // 2. Complaint hakida resident details hudukuttade
        const [complaintInfo] = await db.query('SELECT resident_id, title FROM complaints WHERE id = ?', [id]);

        // 3. Resident id iddare, avara notification panel ge hosa message insert maduttade
        if (complaintInfo.length > 0 && complaintInfo[0].resident_id) {
            const residentId = complaintInfo[0].resident_id;
            const title = complaintInfo[0].title;

            const notificationTitle = 'Ticket Status Updated';
            const notificationMessage = `Your maintenance request "${title}" has been marked as ${status.replace('_', ' ').toUpperCase()}.`;

            await db.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "maintenance")',
                [residentId, notificationTitle, notificationMessage]
            );
        }

        res.status(200).json({ message: 'Status updated and notification sent!' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Failed to update status', error });
    }
};