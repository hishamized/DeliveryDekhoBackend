// backend/jobs/deadlineCron.js

const cron = require('node-cron');
const { Op } = require('sequelize');
const db = require("../models");

const Deadline = db.Deadline;

const deadlineChecker = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      const missedDeadlines = await Deadline.findAll({
        where: {
          status: 'pending',
          deadline_expire_time: {
            [Op.lt]: now
          }
        }
      });

      for (const deadline of missedDeadlines) {
        await deadline.update({ status: 'missed' });

        // Your notification logic
        console.log(`Deadline missed: ${deadline.id}`);
        // Optionally call your notifyAdmin(deadline) function
      }

    } catch (error) {
      console.error('Error checking deadlines:', error);
    }
  });

  console.log('⏰ Deadline checker cron job initialized.');
};

module.exports = deadlineChecker;
