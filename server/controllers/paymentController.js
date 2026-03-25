const db = require('../config/db');
const cron = require('node-cron');

exports.getAllPayments = async (req, res) => {
    try {
        const query = `
            SELECT p.*, u.unit_number, usr.name as resident_name,
            COALESCE(p.payment_date, p.submitted_date, p.due_date) as updated_at
            FROM payments p 
            JOIN units u ON p.unit_id = u.id 
            LEFT JOIN users usr ON usr.unit_no = u.unit_number
            ORDER BY p.due_date DESC
        `;
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database query failed', error });
    }
};

exports.createInvoice = async (req, res) => {
    const { unit_id, amount, due_date } = req.body;
    try {
        await db.query(
            'INSERT INTO payments (unit_id, amount, balance, due_date, status) VALUES (?, ?, ?, ?, "pending")',
            [unit_id, amount, amount, due_date]
        );

        try {
            const [unitInfo] = await db.query(`
                SELECT u.unit_number, usr.id as owner_id 
                FROM units u 
                LEFT JOIN users usr ON usr.unit_no = u.unit_number 
                WHERE u.id = ?`, [unit_id]);

            if (unitInfo.length > 0 && unitInfo[0].owner_id) {
                const residentId = unitInfo[0].owner_id;
                const notificationMessage = `A new maintenance bill of LKR ${Number(amount).toLocaleString()} has been generated for Unit ${unitInfo[0].unit_number}. Due date: ${new Date(due_date).toDateString()}.`;

                await db.query(
                    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, "New Invoice Generated", ?, "maintenance")',
                    [residentId, notificationMessage]
                );
            }
        } catch (notifErr) {
            console.log("⚠️ Notification failed but invoice generated:", notifErr.message);
        }
        res.status(201).json({ message: 'Invoice generated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create invoice', error: error.message });
    }
};

exports.uploadSlip = async (req, res) => {
    const { id } = req.params;
    const { slip_image, submitted_amount, submitted_date } = req.body;

    try {
        console.log(`📥 Received upload request for Bill ID: ${id}`);

        if (slip_image) {
            console.log(`📦 Image Size: ${(slip_image.length / 1024 / 1024).toFixed(2)} MB`);
        }

        await db.query(
            'UPDATE payments SET slip_image = ?, submitted_amount = ?, submitted_date = ?, status = "under_review" WHERE id = ?',
            [slip_image, submitted_amount, submitted_date, id]
        );

        console.log(`✅ Upload successful for Bill ID: ${id}`);
        res.status(200).json({ message: 'Payment slip uploaded! Waiting for admin approval.' });

    } catch (error) {
        console.error('❌ DATABASE UPLOAD ERROR:', error);
        res.status(500).json({ message: 'Failed to upload slip', error: error.message });
    }
};

exports.approvePayment = async (req, res) => {
    const { id } = req.params;
    const { approved_amount } = req.body;

    try {
        const [paymentInfo] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
        if (paymentInfo.length === 0) return res.status(404).json({ message: 'Payment not found' });

        const bill = paymentInfo[0];
        const newPaidAmount = Number(bill.paid_amount || 0) + Number(approved_amount);
        const newBalance = Number(bill.amount) - newPaidAmount;

        let newStatus = 'pending';
        if (newBalance <= 0) {
            newStatus = 'paid';
        } else if (newPaidAmount > 0) {
            newStatus = 'partially_paid';
        }

        const receiptUrl = `REC-${Date.now()}-${id}`;

        await db.query(
            'UPDATE payments SET paid_amount = ?, balance = ?, status = ?, receipt_url = ?, payment_date = CURDATE() WHERE id = ?',
            [newPaidAmount, newBalance, newStatus, receiptUrl, id]
        );

        try {
            const [unitInfo] = await db.query(`
                SELECT usr.id as owner_id 
                FROM units u 
                JOIN users usr ON usr.unit_no = u.unit_number 
                WHERE u.id = ?`, [bill.unit_id]);

            if (unitInfo.length > 0 && unitInfo[0].owner_id) {
                const notifMsg = `Your payment of LKR ${Number(approved_amount).toLocaleString()} has been approved. Receipt No: ${receiptUrl}. ${newBalance > 0 ? `Remaining Balance: LKR ${newBalance.toLocaleString()}` : 'Bill fully settled!'}`;
                await db.query(
                    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, "Payment Approved! 🎉", ?, "maintenance")',
                    [unitInfo[0].owner_id, notifMsg]
                );
            }
        } catch (notifErr) {
            console.log("⚠️ Notification failed but payment approved:", notifErr.message);
        }
        res.status(200).json({ message: `Payment approved! Status: ${newStatus}`, balance: newBalance });
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve payment', error });
    }
};

exports.rejectPayment = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE payments SET status = "rejected", slip_image = NULL WHERE id = ?', [id]);
        res.status(200).json({ message: 'Payment rejected. Resident needs to re-upload.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reject payment', error });
    }
};

exports.sendOverdueReminders = async (req, res) => {
    try {
        const [overdueBills] = await db.query(`
            SELECT p.id, p.balance, p.due_date, usr.id as owner_id, u.unit_number 
            FROM payments p 
            JOIN units u ON p.unit_id = u.id 
            JOIN users usr ON usr.unit_no = u.unit_number
            WHERE p.due_date < CURDATE() AND p.status IN ('pending', 'partially_paid')
        `);

        let sentCount = 0;
        for (const bill of overdueBills) {
            if (bill.owner_id) {
                try {
                    const notifMsg = `🚨 Reminder: Your maintenance bill for Unit ${bill.unit_number} is OVERDUE. Please settle the remaining balance of LKR ${Number(bill.balance).toLocaleString()} immediately.`;
                    await db.query(
                        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, "Overdue Payment Alert!", ?, "maintenance")',
                        [bill.owner_id, notifMsg]
                    );
                    sentCount++;
                } catch (err) {}
            }
        }
        res.status(200).json({ message: `Sent ${sentCount} overdue reminders successfully!` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send reminders', error });
    }
};

exports.getResidentPayments = async (req, res) => {
    const { resident_id } = req.params;
    try {
        const query = `
            SELECT p.*, u.unit_number 
            FROM payments p 
            JOIN units u ON p.unit_id = u.id 
            JOIN users usr ON usr.unit_no = u.unit_number
            WHERE usr.id = ?
            ORDER BY p.due_date DESC
        `;
        const [rows] = await db.query(query, [resident_id]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch resident bills', error });
    }
};

exports.updatePayment = async (req, res) => {
    const { id } = req.params;
    const { amount, due_date, status } = req.body;
    try {
        const formattedDate = new Date(due_date).toISOString().split('T')[0];

        if (status === 'paid') {
            await db.query(
                'UPDATE payments SET amount = ?, due_date = ?, status = ?, balance = 0, paid_amount = ?, payment_date = CURDATE() WHERE id = ?',
                [amount, formattedDate, status, amount, id]
            );
        } else if (status === 'pending') {
            await db.query(
                'UPDATE payments SET amount = ?, due_date = ?, status = ?, balance = ?, paid_amount = 0 WHERE id = ?',
                [amount, formattedDate, status, amount, id]
            );
        } else {
            await db.query(
                'UPDATE payments SET amount = ?, due_date = ?, status = ? WHERE id = ?',
                [amount, formattedDate, status, id]
            );
        }

        res.status(200).json({ message: 'Payment updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update payment', error });
    }
};

exports.deletePayment = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM payments WHERE id = ?', [id]);
        res.status(200).json({ message: 'Payment removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete payment', error });
    }
};

cron.schedule('0 0 1 * *', async () => {
    console.log('⏳ Running Automated Billing Engine...');
    try {
        const query = `
            SELECT un.id AS unit_id, un.unit_number, r.price AS amount, req.user_id AS resident_id
            FROM room_requests req
            JOIN rooms r ON req.room_id = r.id
            JOIN units un ON un.unit_number = req.assigned_unit
            WHERE req.status = 'Approved' AND req.assigned_unit IS NOT NULL
        `;

        const [approvedBookings] = await db.query(query);
        if (approvedBookings.length === 0) return;

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        const formattedDueDate = dueDate.toISOString().split('T')[0];

        for (const booking of approvedBookings) {
            await db.query(
                'INSERT INTO payments (unit_id, amount, balance, due_date, status) VALUES (?, ?, ?, ?, "pending")',
                [booking.unit_id, booking.amount, booking.amount, formattedDueDate]
            );

            try {
                const msg = `Your monthly maintenance bill of LKR ${Number(booking.amount).toLocaleString()} has been auto-generated. Due date: ${formattedDueDate}.`;
                await db.query(
                    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, "Monthly Invoice Generated", ?, "maintenance")',
                    [booking.resident_id, msg]
                );
            } catch (err) {}
        }
        console.log('🎉 Automated Billing Completed!');
    } catch (error) {
        console.error('❌ Error running auto-billing:', error.message);
    }
});