import sendEmail from '../logging/mail.js';
import {User, Inventory, Cart, Item} from '../models/index.js';
import logger from '../logging/logger.js';

async function build(platform, userId) {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            logger.error(`Build failed: User with ID ${userId} not found.`);
            return;
        }

        // Simulate build process
        logger.info(`Starting build for platform: ${platform}, user ID: ${userId}`);
        if (platform === 'mac') {
              const filePath = path.join(process.cwd(), 'uploads', "builds", 'EraSwap.zip');
              res.download(filePath, 'EraSwap.zip');
        } else if (platform === 'windows') {
              const filePath = path.join(process.cwd(), 'uploads', "builds", 'EraSwapWindows.zip');
              res.download(filePath, 'EraSwapWindows.zip');
        }
            logger.info(`Build for platform: ${platform}, user ID: ${userId} completed successfully.`);
            var user = await User.findByPk(userId);
            logger.info(`Notification email sent to user ID: ${userId} at ${user.email}`);
            await sendEmail("l.bauscher@icloud.com", 'Build Downloaded', `${user.username} with ${user.email} has downloaded the ${platform} build.`);
    } catch (error) {
        logger.error(`Build error for platform: ${platform}, user ID: ${userId}: ${error.message}`);
    }
}

export default { build };