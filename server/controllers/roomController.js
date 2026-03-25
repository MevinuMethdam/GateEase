const db = require('../config/db');

exports.getAllRooms = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM rooms ORDER BY created_at DESC');
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.addRoom = async (req, res) => {
    const { title, price, features, image_url, status } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO rooms (title, price, features, image_url, status) VALUES (?, ?, ?, ?, ?)',
            [title, price, features, image_url, status || 'Available']
        );
        res.status(201).json({ message: 'Room added successfully!', roomId: result.insertId });
    } catch (error) {
        console.error("Error adding room:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.updateRoom = async (req, res) => {
    const roomId = req.params.id;
    const { title, price, features, image_url, status } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE rooms SET title=?, price=?, features=?, image_url=?, status=? WHERE id=?',
            [title, price, features, image_url, status, roomId]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Room not found' });
        res.status(200).json({ message: 'Room updated successfully!' });
    } catch (error) {
        console.error("Error updating room:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.deleteRoom = async (req, res) => {
    const roomId = req.params.id;
    try {
        const [result] = await db.query('DELETE FROM rooms WHERE id=?', [roomId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Room not found' });
        res.status(200).json({ message: 'Room deleted successfully!' });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.requestRoom = async (req, res) => {
    const { room_id, user_id } = req.body;
    try {
        await db.query(
            'INSERT INTO room_requests (room_id, user_id, status) VALUES (?, ?, "Pending")',
            [room_id, user_id]
        );

        try {
            const [admins] = await db.query('SELECT id FROM users WHERE role != "resident" LIMIT 1');

            if (admins.length > 0) {
                const adminId = admins[0].id;
                const notifTitle = "New Booking Request!";
                const notifMessage = "A resident has requested a new room. Please review it.";

                await db.query(
                    'INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, FALSE)',
                    [adminId, notifTitle, notifMessage]
                );
                console.log("✅ Admin notification saved for ID:", adminId);
            } else {
                console.log("❌ Admin account not found in database!");
            }
        } catch (notifErr) {
            console.error("Admin notification error:", notifErr.message);
        }

        res.status(201).json({ message: 'Room requested successfully!' });
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: "This room does not exist in the Database yet!" });
        }
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const query = `
            SELECT 
                req.id, 
                r.title AS roomName, 
                u.name AS residentName, 
                DATE_FORMAT(req.requested_at, '%Y-%m-%d') AS date, 
                req.status 
            FROM room_requests req
            JOIN rooms r ON req.room_id = r.id
            JOIN users u ON req.user_id = u.id
            WHERE req.status = 'Pending'
        `;
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.approveRequest = async (req, res) => {
    const requestId = req.params.id;
    const { unit_number } = req.body;

    try {
        const assignedUnit = unit_number || 'Pending Assignment';
        await db.query(
            `UPDATE room_requests SET status = 'Approved', assigned_unit = ? WHERE id = ?`,
            [assignedUnit, requestId]
        );

        if (assignedUnit !== 'Pending Assignment') {
            try {
                await db.query(`UPDATE units SET status = 'rented' WHERE unit_number = ?`, [assignedUnit]);
            } catch (err) {
                console.error("Warning: Could not update units table.", err.message);
            }

            let residentId = null; // 🌟 Resident ගේ ID එක අල්ලගන්න Variable එකක් දැම්මා

            try {
                const [reqInfo] = await db.query(`SELECT user_id FROM room_requests WHERE id = ?`, [requestId]);
                if (reqInfo.length > 0) {
                    residentId = reqInfo[0].user_id; // ID එක සේව් කරගත්තා
                    await db.query(`UPDATE users SET unit_no = ? WHERE id = ?`, [assignedUnit, residentId]);
                }
            } catch (err) {
                console.error("Warning: Could not link unit to user.", err.message);
            }

            if (residentId) {
                try {
                    const notifTitle = "Room Approved! 🎉";
                    const notifMessage = `Your booking request has been approved. Assigned Unit: ${assignedUnit}.`;

                    await db.query(
                        'INSERT INTO notifications (user_id, title, message, is_read) VALUES (?, ?, ?, FALSE)',
                        [residentId, notifTitle, notifMessage]
                    );
                    console.log("✅ Resident notification saved for ID:", residentId);
                } catch (notifErr) {
                    console.error("Resident notification error:", notifErr.message);
                }
            }
        }

        res.status(200).json({ message: 'Request Approved & Unit Assigned successfully!' });
    } catch (error) {
        console.error("Fatal error approving request:", error.message);
        res.status(500).json({ message: "Server Error: Could not approve request." });
    }
};

exports.rejectRequest = async (req, res) => {
    const requestId = req.params.id;
    try {
        const [result] = await db.query(`UPDATE room_requests SET status = 'Rejected' WHERE id = ?`, [requestId]);
        res.status(200).json({ message: 'Request Rejected Successfully!' });
    } catch (error) {
        console.error("Error rejecting request:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getMyRequests = async (req, res) => {
    const userId = req.params.userId;
    try {
        const [results] = await db.query('SELECT id, room_id, status, assigned_unit FROM room_requests WHERE user_id = ?', [userId]);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching my requests:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getApprovedBookings = async (req, res) => {
    try {
        const query = `
            SELECT 
                req.id, 
                r.title AS roomName, 
                u.name AS residentName, 
                req.assigned_unit AS unitNumber,
                DATE_FORMAT(req.requested_at, '%Y-%m-%d') AS date 
            FROM room_requests req
            JOIN rooms r ON req.room_id = r.id
            JOIN users u ON req.user_id = u.id
            WHERE req.status = 'Approved'
            ORDER BY req.requested_at DESC
        `;
        const [results] = await db.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching approved bookings:", error);
        res.status(500).json({ message: "Server Error" });
    }
};