const db = require('../config/db');

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

exports.createBooking = async (req, res) => {
    const { resident_id, facility_name, booking_date, start_time, end_time } = req.body;

    if (!resident_id || !facility_name || !booking_date || !start_time || !end_time) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const selectedDate = new Date(booking_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        return res.status(400).json({ message: 'Cannot book facilities for past dates.' });
    }

    const startTimeNum = parseInt(start_time.replace(':', ''));
    const endTimeNum = parseInt(end_time.replace(':', ''));

    if (endTimeNum <= startTimeNum) {
        return res.status(400).json({ message: 'End time must be later than start time.' });
    }

    try {
        const [facilityInfo] = await db.query(
            'SELECT type, capacity, open_time, close_time, requires_approval FROM facilities WHERE name = ?',
            [facility_name]
        );

        if (facilityInfo.length === 0) {
            return res.status(404).json({ message: 'Facility rules not found in database.' });
        }

        const facility = facilityInfo[0];
        const openTimeNum = parseInt(facility.open_time.substring(0, 5).replace(':', ''));
        const closeTimeNum = parseInt(facility.close_time.substring(0, 5).replace(':', ''));

        if (startTimeNum < openTimeNum || endTimeNum > closeTimeNum) {
            return res.status(400).json({
                message: `Booking failed. ${facility_name.replace('_', ' ')} is only open from ${facility.open_time.substring(0, 5)} to ${facility.close_time.substring(0, 5)}.`
            });
        }

        // 🌟 UPDATE: Time-based Maintenance Check
        const [maintenanceDates] = await db.query(
            `SELECT reason FROM facility_maintenance 
             WHERE facility_id = (SELECT id FROM facilities WHERE name = ?) 
             AND blackout_date = ?
             AND (start_time < ? AND end_time > ?)`, // Overlap logic
            [facility_name, booking_date, end_time, start_time]
        );

        if (maintenanceDates.length > 0) {
            return res.status(400).json({
                message: `Sorry, this facility is blocked for maintenance (${maintenanceDates[0].reason}) during this time.`
            });
        }

        const conflictQuery = `
            SELECT id FROM bookings 
            WHERE facility_name = ? 
            AND booking_date = ? 
            AND status IN ('confirmed', 'pending')
            AND (start_time < ? AND end_time > ?)
        `;

        const [overlappingBookings] = await db.query(conflictQuery, [facility_name, booking_date, end_time, start_time]);

        if (facility.type === 'exclusive') {
            if (overlappingBookings.length > 0) {
                return res.status(400).json({ message: 'This facility is exclusively booked for this time slot!' });
            }
        } else {
            if (overlappingBookings.length >= facility.capacity) {
                return res.status(400).json({ message: `Facility is fully booked for this time slot. Maximum capacity is ${facility.capacity}.` });
            }
        }

        const initialStatus = facility.requires_approval ? 'pending' : 'confirmed';

        await db.query(
            'INSERT INTO bookings (resident_id, facility_name, booking_date, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?)',
            [resident_id, facility_name, booking_date, start_time, end_time, initialStatus]
        );

        try {
            const [admins] = await db.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
            const [resident] = await db.query('SELECT name FROM users WHERE id = ?', [resident_id]);
            const residentName = resident.length > 0 ? resident[0].name : 'A Resident';

            let formattedDate = booking_date;
            if (typeof booking_date === 'string') formattedDate = booking_date.split('T')[0];

            if (admins.length > 0) {
                const adminId = admins[0].id;
                let adminTitle = 'New Facility Booking';
                let adminMessage = `${residentName} has booked the ${facility_name.replace('_', ' ')} for ${formattedDate} from ${start_time} to ${end_time}.`;

                if (initialStatus === 'pending') {
                    adminTitle = 'Booking Approval Required ⚠️';
                    adminMessage = `${residentName} requested the ${facility_name.replace('_', ' ')} for ${formattedDate}. Please approve or reject in the panel.`;
                }

                await db.query(
                    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "maintenance")',
                    [adminId, adminTitle, adminMessage]
                );
            }
        } catch (notifError) {
            console.error('Failed to send admin notification:', notifError);
        }

        const successMessage = facility.requires_approval
            ? 'Booking request sent! Awaiting admin approval.'
            : 'Booking confirmed successfully!';

        res.status(201).json({ message: successMessage });
    } catch (error) {
        console.error('Booking Logic Error:', error);
        res.status(500).json({ message: 'Failed to create booking', error });
    }
};

exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE bookings SET status = "cancelled" WHERE id = ?', [id]);
        res.status(200).json({ message: 'Booking cancelled!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
    }
};

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

exports.updateBooking = async (req, res) => {
    const { id } = req.params;
    const { facility_name, booking_date, start_time, end_time, status } = req.body;
    try {
        let formattedDate = booking_date;
        if (booking_date && typeof booking_date === 'string') {
            formattedDate = String(booking_date).split('T')[0];
        }

        if (status === 'confirmed') {
            // Check conflicts with bookings
            const conflictQueryUpdate = `
                SELECT * FROM bookings 
                WHERE facility_name = ? AND booking_date = ? AND status = 'confirmed' AND id != ? AND (start_time < ? AND end_time > ?)
            `;
            const [conflicts] = await db.query(conflictQueryUpdate, [facility_name, formattedDate, id, end_time, start_time]);
            if (conflicts.length > 0) return res.status(400).json({ message: 'Cannot update: Facility is already booked!' });

            // 🌟 UPDATE: Time-based Maintenance Check for Updates too
            const [maintenanceDates] = await db.query(
                `SELECT reason FROM facility_maintenance 
                 WHERE facility_id = (SELECT id FROM facilities WHERE name = ?) AND blackout_date = ? AND (start_time < ? AND end_time > ?)`,
                [facility_name, formattedDate, end_time, start_time]
            );
            if (maintenanceDates.length > 0) return res.status(400).json({ message: `Cannot update: Blocked for ${maintenanceDates[0].reason}` });
        }

        await db.query(
            'UPDATE bookings SET facility_name = ?, booking_date = ?, start_time = ?, end_time = ?, status = ? WHERE id = ?',
            [facility_name, formattedDate, start_time, end_time, status, id]
        );
        res.status(200).json({ message: 'Booking updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update booking', error: error.message });
    }
};

exports.deleteBooking = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM bookings WHERE id = ?', [id]);
        res.status(200).json({ message: 'Booking removed successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete booking', error });
    }
};

// ==========================================
// 🌟 Blackout Dates Management (Maintenance)
// ==========================================

exports.addBlackoutDate = async (req, res) => {
    // 🌟 UPDATE: Getting start_time and end_time from req.body
    const { facility_name, blackout_date, start_time, end_time, reason } = req.body;
    try {
        const [facility] = await db.query('SELECT id FROM facilities WHERE name = ?', [facility_name]);
        if (facility.length === 0) return res.status(404).json({ message: 'Facility not found' });

        await db.query(
            'INSERT INTO facility_maintenance (facility_id, blackout_date, start_time, end_time, reason) VALUES (?, ?, ?, ?, ?)',
            [facility[0].id, blackout_date, start_time, end_time, reason || 'Maintenance / Closed']
        );
        res.status(201).json({ message: 'Blackout time slot added successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add blackout date', error });
    }
};

exports.getBlackoutDates = async (req, res) => {
    try {
        // 🌟 UPDATE: Selecting start_time and end_time
        const query = `
            SELECT fm.id, f.name as facility_name, fm.blackout_date, fm.start_time, fm.end_time, fm.reason
            FROM facility_maintenance fm
            JOIN facilities f ON fm.facility_id = f.id
            ORDER BY fm.blackout_date ASC, fm.start_time ASC
        `;
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch blackout dates', error });
    }
};

exports.deleteBlackoutDate = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM facility_maintenance WHERE id = ?', [id]);
        res.status(200).json({ message: 'Blackout time slot removed!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete blackout date', error });
    }
};