const cron = require('node-cron');
const db = require('../config/db');

const startCronJobs = () => {
    console.log('⏳ Cron Jobs Initialized...');
    cron.schedule('0 0 * * *', async () => {
        console.log('🔄 Running Auto-Invoice Generation...');
        try {
            const query = `
                SELECT u.id as unit_id, u.unit_number, usr.id as owner_id, usr.name 
                FROM units u 
                JOIN users usr ON u.owner_id = usr.id 
                WHERE u.occupancy_status IN ('owner_occupied', 'rented')
                AND usr.status != 'inactive'
            `;
            const [occupiedUnits] = await db.query(query);

            const maintenanceFee = 5000.00;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 10);
            const formattedDueDate = dueDate.toISOString().split('T')[0];

            for (const unit of occupiedUnits) {
                await db.query(
                    'INSERT INTO payments (unit_id, amount, due_date, status) VALUES (?, ?, ?, "pending")',
                    [unit.unit_id, maintenanceFee, formattedDueDate]
                );

                const notificationTitle = 'New Maintenance Invoice';
                const notificationMessage = `Your maintenance bill of LKR ${maintenanceFee.toLocaleString()} for Unit ${unit.unit_number} has been generated. Due date is ${dueDate.toDateString()}.`;

                await db.query(
                    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "billing")',
                    [unit.owner_id, notificationTitle, notificationMessage]
                );
            }
            console.log(`✅ Auto-invoicing & Notifications completed for ${occupiedUnits.length} units.`);
        } catch (error) {
            console.error('❌ Auto-invoicing failed:', error);
        }
    });

    cron.schedule('0 0 * * *', async () => {
        console.log('📅 Checking for Expiring Lease Agreements...');
        try {
            const query = `
                SELECT id, name, unit_no, agreement_end_date 
                FROM users 
                WHERE role = 'resident' 
                AND status != 'inactive' 
                AND agreement_end_date = CURDATE() + INTERVAL 30 DAY
            `;
            const [expiringUsers] = await db.query(query);

            for (const user of expiringUsers) {
                const notifTitle = '⚠️ Lease Agreement Expiring Soon';
                const notifMsg = `Dear ${user.name}, your lease agreement for Unit ${user.unit_no} is expiring on ${new Date(user.agreement_end_date).toDateString()}. Please contact management to renew.`;

                await db.query(
                    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "maintenance")',
                    [user.id, notifTitle, notifMsg]
                );
            }

            if(expiringUsers.length > 0) {
                console.log(`✅ Sent expiration notices to ${expiringUsers.length} residents.`);
            } else {
                console.log('✅ No agreements expiring in 30 days.');
            }

        } catch (error) {
            console.error('❌ Agreement checker failed:', error);
        }
    });

};

module.exports = startCronJobs;