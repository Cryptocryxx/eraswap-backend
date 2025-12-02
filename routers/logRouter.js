//Imports
import express from 'express';

const router = express.Router()
const logMiddleware = require("./logMiddleware");

router.use(logMiddleware);
const log = require('../controllers/logController')

//Router, die an Controller weiterleiten
router.post('/email', log.sendEMail)
router.post('/', log.logFile)

export default router;