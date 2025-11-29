//Imports
const express = require('express') 
const router = express.Router()
const logMiddleware = require("./logMiddleware");

router.use(logMiddleware);
const itemsController = require('../controllers/itemsController')


router.get('/', itemsController.getItems)
router.get('/:itemID', itemsController.getItemByID)
router.post('/', itemsController.addItem)
router.put('/:itemID', itemsController.updateItem)
router.delete('/:itemID', itemsController.deleteItem)

module.exports = router