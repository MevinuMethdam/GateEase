const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const [[{ total_residents }]] = await db.query('SELECT COUNT(*) AS total_residents FROM users WHERE role = "resident"');
        const [[{ pending_complaints }]] = await db.query('SELECT COUNT(*) AS pending_complaints FROM complaints WHERE status = "open"');
        const [[{ total_revenue }]] = await db.query('SELECT SUM(amount) AS total_revenue FROM payments WHERE status = "paid"');
        const [[{ pending_visitors }]] = await db.query('SELECT COUNT(*) AS pending_visitors FROM visitors WHERE approval_status = "pending"');
        const [recent_activities] = await db.query(`
            SELECT name, unit_no AS unit_number, created_at 
            FROM users 
            WHERE role = 'resident' 
            ORDER BY created_at DESC 
            LIMIT 20
        `);

        res.status(200).json({
            totalResidents: total_residents || 0,
            pendingComplaints: pending_complaints || 0,
            totalRevenue: total_revenue || 0,
            pendingVisitors: pending_visitors || 0,
            recentActivities: recent_activities
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats', error });
    }
};

exports.getResidentDashboard = async (req, res) => {
    const { id } = req.params;

    try {
        const [[{ total_due }]] = await db.query(`
            SELECT SUM(IF(p.balance > 0, p.balance, p.amount)) as total_due 
            FROM payments p 
            JOIN units u ON p.unit_id = u.id 
            JOIN users usr ON usr.unit_no = u.unit_number
            WHERE usr.id = ? AND p.status IN ('pending', 'partially_paid')
        `, [id]);

        const [[{ active_complaints }]] = await db.query(`
            SELECT COUNT(*) as active_complaints 
            FROM complaints 
            WHERE resident_id = ? AND status != 'resolved'
        `, [id]);

        const [[{ pending_visitors }]] = await db.query(`
            SELECT COUNT(*) as pending_visitors 
            FROM visitors 
            WHERE resident_id = ? AND approval_status = 'pending'
        `, [id]);

        const [recent_bills] = await db.query(`
            SELECT p.* FROM payments p 
            JOIN units u ON p.unit_id = u.id 
            JOIN users usr ON usr.unit_no = u.unit_number
            WHERE usr.id = ? 
            ORDER BY p.due_date DESC LIMIT 3
        `, [id]);

        res.status(200).json({
            totalDue: total_due || 0,
            activeComplaints: active_complaints || 0,
            pendingVisitors: pending_visitors || 0,
            recentBills: recent_bills
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch resident stats' });
    }
};