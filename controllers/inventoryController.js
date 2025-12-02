// controllers/inventoryController.js
import { Inventory, InventoryItem, Item, User } from '../models/index.js';
import logger from '../logging/logger.js';
import { sequelize } from '../databases/sequelize.js';

/**
 * GET /api/inventory/:inventoryId
 */
export async function getInventory(req, res) {
  try {
    const { inventoryId } = req.params;
    const inv = await Inventory.findByPk(inventoryId, { include: [{ model: Item }] });
    if (!inv) return res.status(404).json({ error: 'Inventory not found' });
    res.status(200).json(inv);
  } catch (err) {
    logger.error('Get inventory error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/inventory/:inventoryId/items
 * Body: { itemId }
 * Adds the item to the inventory (unique item reference)
 */
export async function addItemToInventory(req, res) {
  const t = await sequelize.transaction();
  try {
    const { inventoryId } = req.params;
    const { itemId } = req.body;
    if (!itemId) { await t.rollback(); return res.status(400).json({ error: 'itemId required' }); }

    const inv = await Inventory.findByPk(inventoryId, { transaction: t });
    if (!inv) { await t.rollback(); return res.status(404).json({ error: 'Inventory not found' }); }

    const item = await Item.findByPk(itemId, { transaction: t });
    if (!item) { await t.rollback(); return res.status(404).json({ error: 'Item not found' }); }

    const [ii, created] = await InventoryItem.findOrCreate({
      where: { inventory_id: inventoryId, item_id: itemId },
      defaults: { inventory_id: inventoryId, item_id: itemId },
      transaction: t,
    });

    if (!created) {
      await t.rollback();
      return res.status(409).json({ error: 'Item already in inventory' });
    }

    await t.commit();
    const updated = await Inventory.findByPk(inventoryId, { include: [{ model: Item }] });
    res.status(200).json(updated);
  } catch (err) {
    await t.rollback();
    logger.error('Add inventory item error:', err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * DELETE /api/inventory/:inventoryId/items/:itemId
 */
export async function removeInventoryItem(req, res) {
  try {
    const { inventoryId, itemId } = req.params;
    const ii = await InventoryItem.findOne({ where: { inventory_id: inventoryId, item_id: itemId } });
    if (!ii) return res.status(404).json({ error: 'Inventory item not found' });
    await ii.destroy();
    const updated = await Inventory.findByPk(inventoryId, { include: [{ model: Item }] });
    res.status(200).json(updated);
  } catch (err) {
    logger.error('Remove inventory item error:', err);
    res.status(500).json({ error: err.message });
  }
}

export default {
  getInventory,
  addItemToInventory,
  removeInventoryItem,
};
