const db = require('../config/db');

// 1. ඔක්කොම Bookings ටික ගන්න
exports.getAllBookings = async (req, res) => {
    try {
        const query = `
            SELECT b.*, u.name as resident_name 
            FROM bookings b 
            JOIN users u ON b.resident_id = u.id 
            ORDER BY b.booking_date DESC, b.start_time ASC
        `;
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Database query failed', error });
    }
};

// 2. අලුත් Booking එකක් දාන්න (Conflict Detection සහ Admin Notification එකත් එක්කම)
exports.createBooking = async (req, res) => {
    const { resident_id, facility_name, booking_date, start_time, end_time } = req.body;

    try {
        const conflictQuery = `
            SELECT * FROM bookings 
            WHERE facility_name = ? 
            AND booking_date = ? 
            AND status = 'confirmed'
            AND (start_time < ? AND end_time > ?)
        `;
        const [conflicts] = await db.query(conflictQuery, [facility_name, booking_date, end_time, start_time]);

        if (conflicts.length > 0) {
            return res.status(400).json({ message: 'Facility is already booked for this time slot!' });
        }

        // Booking එක සේව් කරනවා
        await db.query(
            'INSERT INTO bookings (resident_id, facility_name, booking_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, "confirmed")',
            [resident_id, facility_name, booking_date, start_time, end_time]
        );

        // ⬇️ මෙන්න අලුතින් එකතු කරපු ADMIN NOTIFICATION කෑල්ල ⬇️
        try {
            // Admin ගේ ID එක හොයාගන්නවා
            const [admins] = await db.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');

            // Resident ගේ නම ගන්නවා
            const [resident] = await db.query('SELECT name FROM users WHERE id = ?', [resident_id]);
            const residentName = resident.length > 0 ? resident[0].name : 'A Resident';
            const safeFacilityName = facility_name ? String(facility_name).replace(/_/g, ' ').toUpperCase() : 'FACILITY';

            // Date එක ෆෝමැට් කරනවා
            let formattedDate = booking_date;
            if (typeof booking_date === 'string') {
                formattedDate = booking_date.split('T')[0];
            }

            if (admins.length > 0) {
                const adminId = admins[0].id;
                const adminTitle = 'New Facility Booking';
                const adminMessage = `${residentName} has booked the ${safeFacilityName} for ${formattedDate} from ${start_time} to ${end_time}.`;

                // Admin ගේ Database එකට Notification එක දානවා
                await db.query(
                    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "maintenance")',
                    [adminId, adminTitle, adminMessage]
                );
            }
        } catch (notifError) {
            console.error('Failed to send admin notification:', notifError);
            // Notification එක යවන්න බැරි වුණත් Booking එක සාර්ථක නිසා අපි Error එකක් යවන්නේ නෑ
        }
        // ⬆️ ADMIN NOTIFICATION කෑල්ල ඉවරයි ⬆️

        res.status(201).json({ message: 'Booking confirmed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create booking', error });
    }
};

// 3. Booking එක Cancel කරන්න (Notification යවන කෑල්ලත් එක්ක)
exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE bookings SET status = "cancelled" WHERE id = ?', [id]);

        const [bookingInfo] = await db.query('SELECT resident_id, facility_name, booking_date FROM bookings WHERE id = ?', [id]);

        if (bookingInfo.length > 0 && bookingInfo[0].resident_id) {
            const residentId = bookingInfo[0].resident_id;
            const facilityName = bookingInfo[0].facility_name ? String(bookingInfo[0].facility_name).replace(/_/g, ' ').toUpperCase() : 'FACILITY';

            let formattedDate = bookingInfo[0].booking_date;
            if (formattedDate instanceof Date) {
                formattedDate = formattedDate.toISOString().split('T')[0];
            } else if (typeof formattedDate === 'string') {
                formattedDate = formattedDate.split('T')[0];
            }

            const notificationTitle = 'Booking Cancelled';
            const notificationMessage = `Your reservation for the ${facilityName} on ${formattedDate} has been cancelled.`;

            await db.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "maintenance")',
                [residentId, notificationTitle, notificationMessage]
            );
        }

        res.status(200).json({ message: 'Booking cancelled and notification sent!' });
    } catch (error) {
        console.error('Cancel Booking Error:', error);
        res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
    }
};

// 4. Resident කෙනෙකුගේ Bookings ගැනීම
exports.getResidentBookings = async (req, res) => {
    const { resident_id } = req.params;
    try {
        const query = `
            SELECT * FROM bookings 
            WHERE resident_id = ? 
            ORDER BY booking_date DESC, start_time ASC
        `;
        const [rows] = await db.query(query, [resident_id]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch resident bookings', error });
    }
};

// 5. Booking එකක විස්තර වෙනස් කිරීම - Edit (Notification යවන කෑල්ලත් එක්ක)
exports.updateBooking = async (req, res) => {
    const { id } = req.params;
    const { facility_name, booking_date, start_time, end_time, status } = req.body;
    try {
        let formattedDate = booking_date;
        if (booking_date) {
            formattedDate = String(booking_date).split('T')[0];
        }

        await db.query(
            'UPDATE bookings SET facility_name = ?, booking_date = ?, start_time = ?, end_time = ?, status = ? WHERE id = ?',
            [facility_name, formattedDate, start_time, end_time, status, id]
        );

        const [bookingInfo] = await db.query('SELECT resident_id FROM bookings WHERE id = ?', [id]);

        if (bookingInfo.length > 0 && bookingInfo[0].resident_id) {
            const residentId = bookingInfo[0].resident_id;
            const safeFacilityName = facility_name ? String(facility_name).replace(/_/g, ' ').toUpperCase() : 'FACILITY';
            const safeStatus = status ? String(status).toUpperCase() : 'UPDATED';

            const notificationTitle = 'Booking Updated';
            const notificationMessage = `Your reservation for the ${safeFacilityName} on ${formattedDate} has been updated to ${safeStatus}.`;

            await db.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "maintenance")',
                [residentId, notificationTitle, notificationMessage]
            );
        }

        res.status(200).json({ message: 'Booking updated successfully!' });
    } catch (error) {
        console.error('Update Booking Error:', error);
        res.status(500).json({ message: 'Failed to update booking', error: error.message });
    }
};

// 6. Booking එකක් අයින් කිරීම (Delete)
exports.deleteBooking = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM bookings WHERE id = ?', [id]);
        res.status(200).json({ message: 'Booking removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete booking', error });
    }
};