const db = require('../config/db');

// 1. ඔක්කොම Payments ටික සහ අදාළ ගෙදර විස්තර ගන්න
exports.getAllPayments = async (req, res) => {
    try {
        const query = `
            SELECT p.*, u.unit_number, usr.name as resident_name 
            FROM payments p 
            JOIN units u ON p.unit_id = u.id 
            LEFT JOIN users usr ON u.owner_id = usr.id
            ORDER BY p.due_date DESC
        `;
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database query failed', error });
    }
};

// 2. අලුත් බිලක් (Invoice එකක්) හදන්න සහ Notification යවන්න
exports.createInvoice = async (req, res) => {
    const { unit_id, amount, due_date } = req.body;
    try {
        // 1. මුලින්ම පරණ විදියටම බිල Database එකට සේව් කරනවා
        await db.query(
            'INSERT INTO payments (unit_id, amount, due_date, status) VALUES (?, ?, ?, "pending")',
            [unit_id, amount, due_date]
        );

        // 2. ඒ Unit එකේ ඉන්න අයිතිකාරයා (Resident) කවුද කියලා හොයාගන්නවා
        const [unitInfo] = await db.query('SELECT owner_id, unit_number FROM units WHERE id = ?', [unit_id]);

        // 3. Resident කෙනෙක් ඉන්නවා නම් එයාට Notification එකක් දානවා
        if (unitInfo.length > 0 && unitInfo[0].owner_id) {
            const residentId = unitInfo[0].owner_id;
            const unitNumber = unitInfo[0].unit_number;

            const notificationTitle = 'New Invoice Generated';
            const notificationMessage = `A new maintenance bill of LKR ${Number(amount).toLocaleString()} has been generated for Unit ${unitNumber}. Due date is ${new Date(due_date).toDateString()}.`;

            await db.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "billing")',
                [residentId, notificationTitle, notificationMessage]
            );
        }

        res.status(201).json({ message: 'Invoice generated successfully!' });
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ message: 'Failed to create invoice', error });
    }
};

// 3. ගෙවීමක් සම්පූර්ණයි කියලා Approve කරන්න (Mark as Paid)
exports.approvePayment = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(
            'UPDATE payments SET status = "paid", payment_date = CURDATE() WHERE id = ?',
            [id]
        );
        res.status(200).json({ message: 'Payment approved successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve payment', error });
    }
};

// Resident කෙනෙකුගේ බිල්පත් පමණක් ලබා ගැනීම
exports.getResidentPayments = async (req, res) => {
    const { resident_id } = req.params;
    try {
        const query = `
            SELECT p.*, u.unit_number 
            FROM payments p 
            JOIN units u ON p.unit_id = u.id 
            WHERE u.owner_id = ?
            ORDER BY p.due_date DESC
        `;
        const [rows] = await db.query(query, [resident_id]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch resident bills', error });
    }
};

// බිලක් වෙනස් කිරීම (Edit)
exports.updatePayment = async (req, res) => {
    const { id } = req.params;
    const { amount, due_date, status } = req.body;
    try {
        // දිනය හරියටම MySQL format එකට හදාගන්නවා
        const formattedDate = new Date(due_date).toISOString().split('T')[0];

        await db.query(
            'UPDATE payments SET amount = ?, due_date = ?, status = ? WHERE id = ?',
            [amount, formattedDate, status, id]
        );
        res.status(200).json({ message: 'Payment updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update payment', error });
    }
};

// බිලක් අයින් කිරීම (Delete)
exports.deletePayment = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM payments WHERE id = ?', [id]);
        res.status(200).json({ message: 'Payment removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete payment', error });
    }
};