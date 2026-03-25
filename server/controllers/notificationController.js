const db = require('../config/db');

exports.getUserNotifications = async (req, res) => {
    const { user_id } = req.params;
    try {
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 2000',
            [user_id]
        );
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
        res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to mark as read' });
    }
};