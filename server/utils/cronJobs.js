const cron = require('node-cron');
const db = require('../config/db');

const startCronJobs = () => {
    console.log('⏳ Cron Jobs Initialized...');

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
};

module.exports = startCronJobs;