const db = require('../config/db');

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

exports.createComplaint = async (req, res) => {
    // 🌟 NEW: Added 'category' to destructuring
    const { resident_id, title, description, category, priority } = req.body;
    try {
        // 🌟 NEW: Added 'category' to the INSERT query
        await db.query(
            'INSERT INTO complaints (resident_id, title, description, category, priority, status) VALUES (?, ?, ?, ?, ?, "open")',
            [resident_id, title, description, category || 'General', priority]
        );

        try {
            const [admins] = await db.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
            const [resident] = await db.query('SELECT name FROM users WHERE id = ?', [resident_id]);
            const residentName = resident.length > 0 ? resident[0].name : 'A Resident';

            if (admins.length > 0) {
                const adminId = admins[0].id;
                const adminTitle = 'New Maintenance Issue';
                const adminMessage = `${residentName} reported a new ${priority} priority issue: "${title}".`;

                await db.query(
                    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "maintenance")',
                    [adminId, adminTitle, adminMessage]
                );
            }
        } catch (notifError) {
            console.error('Failed to send admin notification:', notifError);
        }

        res.status(201).json({ message: 'Complaint lodged successfully!' });
    } catch (error) {
        console.error('Failed to lodge complaint:', error); // Error එක ලොග් කරනවා ලේසියට
        res.status(500).json({ message: 'Failed to lodge complaint', error });
    }
};

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

exports.updateComplaintDetails = async (req, res) => {
    const { id } = req.params;
    // 🌟 NEW: Added 'category' to destructuring
    const { title, description, category, priority } = req.body;
    try {
        // 🌟 NEW: Added 'category' to the UPDATE query
        await db.query(
            'UPDATE complaints SET title = ?, description = ?, category = ?, priority = ? WHERE id = ?',
            [title, description, category || 'General', priority, id]
        );
        res.status(200).json({ message: 'Complaint updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update complaint', error });
    }
};

exports.deleteComplaint = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM complaints WHERE id = ?', [id]);
        res.status(200).json({ message: 'Complaint removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete complaint', error });
    }
};

exports.updateComplaintStatus = async (req, res) => {
    const { id } = req.params;
    const { status, assigned_staff } = req.body;

    try {
        if (assigned_staff) {
            await db.query('UPDATE complaints SET status = ?, assigned_staff = ? WHERE id = ?', [status, assigned_staff, id]);
        } else {
            await db.query('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);
        }

        const [complaintInfo] = await db.query('SELECT resident_id, title FROM complaints WHERE id = ?', [id]);

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

exports.addComplaintUpdate = async (req, res) => {
    const { id } = req.params;
    const { sender_role, message, image_url } = req.body;

    try {
        await db.query(
            'INSERT INTO complaint_updates (complaint_id, sender_role, message, image_url) VALUES (?, ?, ?, ?)',
            [id, sender_role, message, image_url || null]
        );
        res.status(201).json({ message: 'Update added successfully!' });
    } catch (error) {
        console.error('Error adding complaint update:', error);
        res.status(500).json({ message: 'Failed to add update', error: error.message });
    }
};

exports.getComplaintUpdates = async (req, res) => {
    const { id } = req.params;
    try {
        const [updates] = await db.query(
            'SELECT * FROM complaint_updates WHERE complaint_id = ? ORDER BY created_at ASC',
            [id]
        );
        res.status(200).json(updates);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch updates', error: error.message });
    }
};

exports.submitFeedback = async (req, res) => {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    try {
        await db.query(
            'UPDATE complaints SET rating = ?, feedback = ? WHERE id = ? AND status = "resolved"',
            [rating, feedback, id]
        );
        res.status(200).json({ message: 'Feedback submitted successfully! Thank you.' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
    }
};

exports.getComplaintAnalytics = async (req, res) => {
    try {
        const [[{ total_complaints, resolved_complaints }]] = await db.query(`
            SELECT 
                COUNT(*) as total_complaints,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_complaints
            FROM complaints
        `);

        const [[{ average_rating }]] = await db.query(`
            SELECT AVG(rating) as average_rating FROM complaints WHERE rating > 0
        `);

        const [category_ratings] = await db.query(`
            SELECT priority as category, AVG(rating) as avg_rating, COUNT(*) as total_issues
            FROM complaints 
            WHERE rating > 0
            GROUP BY priority
        `);

        const [staff_performance] = await db.query(`
            SELECT assigned_staff, AVG(rating) as avg_rating, COUNT(*) as completed_jobs 
            FROM complaints 
            WHERE status = 'resolved' AND rating > 0 
            GROUP BY assigned_staff
            ORDER BY avg_rating DESC
        `);

        res.status(200).json({
            total: total_complaints || 0,
            resolved: resolved_complaints || 0,
            averageRating: average_rating ? Number(average_rating).toFixed(1) : 0,
            categoryRatings: category_ratings,
            staffPerformance: staff_performance
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
    }
};

exports.getMaintenanceTasks = async (req, res) => {
    const { staff_name } = req.params;
    try {
        const query = `
            SELECT c.*, u.name as resident_name, u.unit_no
            FROM complaints c 
            JOIN users u ON c.resident_id = u.id 
            WHERE c.assigned_staff = ? 
            ORDER BY c.created_at DESC
        `;
        const [rows] = await db.query(query, [staff_name]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching maintenance tasks:', error);
        res.status(500).json({ message: 'Failed to fetch tasks', error });
    }
};