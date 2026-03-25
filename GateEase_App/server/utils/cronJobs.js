const cron = require('node-cron');
const db = require('../config/db');

const startCronJobs = () => {
    console.log('⏳ Cron Jobs Initialized...');

    // ටෙස්ට් කරන්න ලේසි වෙන්න දැනට හැම විනාඩියකටම Run වෙන්න දාලා තියෙන්නේ ('* * * * *')
    // වැඩේ හරි ගියාම මේක මාසෙකට සැරයක් Run වෙන්න '0 0 1 * *' කියලා වෙනස් කරන්න.
    cron.schedule('* * * * *', async () => {
        console.log('🔄 Running Auto-Invoice Generation...');
        try {
            const query = `
                SELECT u.id as unit_id, u.unit_number, usr.id as owner_id, usr.name 
                FROM units u 
                JOIN users usr ON u.owner_id = usr.id 
                WHERE u.occupancy_status IN ('owner_occupied', 'rented')
            `;
            const [occupiedUnits] = await db.query(query);

            const maintenanceFee = 5000.00;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 10);
            const formattedDueDate = dueDate.toISOString().split('T')[0];

            for (const unit of occupiedUnits) {
                // 1. Pending Bill එක හදනවා
                await db.query(
                    'INSERT INTO payments (unit_id, amount, due_date, status) VALUES (?, ?, ?, "pending")',
                    [unit.unit_id, maintenanceFee, formattedDueDate]
                );

                // 2. ඒකත් එක්කම Notification එකක් දානවා!
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
};

module.exports = startCronJobs;