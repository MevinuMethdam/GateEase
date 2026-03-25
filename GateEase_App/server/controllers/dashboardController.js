const db = require('../config/db');

// ==========================================
// 1. ADMIN DASHBOARD STATS
// ==========================================
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Total Residents ගණන
        const [[{ total_residents }]] = await db.query('SELECT COUNT(*) AS total_residents FROM users WHERE role = "resident"');

        // 2. Pending Complaints ගණන (Open වෙලා තියෙන ඒවා)
        const [[{ pending_complaints }]] = await db.query('SELECT COUNT(*) AS pending_complaints FROM complaints WHERE status = "open"');

        // 3. Total Revenue (ගෙවපු මුළු මුදල)
        const [[{ total_revenue }]] = await db.query('SELECT SUM(amount) AS total_revenue FROM payments WHERE status = "paid"');

        // 4. Pending Visitors (ගේට්ටුව ළඟ ඉන්න අමුත්තන්)
        const [[{ pending_visitors }]] = await db.query('SELECT COUNT(*) AS pending_visitors FROM visitors WHERE approval_status = "pending"');

        // 5. Recent Activities
        const [recent_activities] = await db.query(`
            SELECT u.name, un.unit_number, u.created_at 
            FROM users u 
            LEFT JOIN units un ON u.id = un.owner_id 
            WHERE u.role = 'resident' 
            ORDER BY u.created_at DESC LIMIT 3
        `);

        // ඔක්කොම එකතු කරලා Frontend එකට යවනවා
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
}; // <--- මෙතනින් Admin function එක ඉවරයි

// ==========================================
// 2. RESIDENT DASHBOARD STATS
// ==========================================
exports.getResidentDashboard = async (req, res) => {
    const { id } = req.params; // ලොග් වෙලා ඉන්න Resident ගේ ID එක

    try {
        // 1. ගෙවන්න තියෙන මුළු මුදල (Unpaid Bills)
        const [[{ total_due }]] = await db.query(`
            SELECT SUM(p.amount) as total_due 
            FROM payments p 
            JOIN units u ON p.unit_id = u.id 
            WHERE u.owner_id = ? AND p.status = 'pending'
        `, [id]);

        // 2. විසඳලා නැති පැමිණිලි (Active Complaints)
        const [[{ active_complaints }]] = await db.query(`
            SELECT COUNT(*) as active_complaints 
            FROM complaints 
            WHERE resident_id = ? AND status != 'resolved'
        `, [id]);

        // 3. Approve කරන්න බලන් ඉන්න අමුත්තන් (Pending Gate Entries)
        const [[{ pending_visitors }]] = await db.query(`
            SELECT COUNT(*) as pending_visitors 
            FROM visitors 
            WHERE resident_id = ? AND approval_status = 'pending'
        `, [id]);

        // 4. මෑතකාලීන බිල්පත් 3ක් (Recent Bills)
        const [recent_bills] = await db.query(`
            SELECT p.* FROM payments p 
            JOIN units u ON p.unit_id = u.id 
            WHERE u.owner_id = ? 
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
}; // <--- මෙතනින් Resident function එක ඉවරයි