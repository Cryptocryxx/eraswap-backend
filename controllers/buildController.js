import sendEmail from '../logging/mail.js';
import {User, Inventory, Cart, Item} from '../models/index.js';
import logger from '../logging/logger.js';
import path from 'path';

async function build(platform, userId, res) {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            logger.error(`Build failed: User with ID ${userId} not found.`);
            if (res) return res.status(404).send('User not found');
            return;
        }

        logger.info(`Starting build for platform: ${platform}, user ID: ${userId}`);
        let filePath;
        if (platform === 'mac') {
            filePath = path.join(process.cwd(), 'uploads', 'builds', 'EraSwap.zip');
        } else if (platform === 'windows') {
            filePath = path.join(process.cwd(), 'uploads', 'builds', 'EraSwapWindows.zip');
        }

        if (res && filePath) {
            return res.download(filePath);
        }

        logger.info(`Build for platform: ${platform}, user ID: ${userId} completed successfully.`);
        logger.info(`Notification email sent to user ID: ${userId} at ${user.email}`);
        await sendEmail("l.bauscher@icloud.com", 'Build Downloaded', `${user.username} with ${user.email} has downloaded the ${platform} build.`);
    } catch (error) {
        logger.error(`Build error for platform: ${platform}, user ID: ${userId}: ${error.message}`);
        if (res) return res.status(500).send('Build failed');
    }
}

export default { build };