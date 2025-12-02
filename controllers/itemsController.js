// controllers/itemsController.js
import { Op } from 'sequelize';
import { Item } from '../models/index.js';
import logger from '../logging/logger.js';

/**
 * GET /items
 * - query: page, limit, q (search), category, minPrice, maxPrice, sort (e.g. price:asc)
 */
export async function getAllItems(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      q,
      category,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    const where = {};
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];
    }
    if (category) where.category = category;
    if (minPrice) where.price = { ...(where.price ?? {}), [Op.gte]: Number(minPrice) };
    if (maxPrice) where.price = { ...(where.price ?? {}), [Op.lte]: Number(maxPrice) };

    // sorting
    let order = [['id', 'ASC']];
    if (sort) {
      // format: field:dir  e.g. price:desc
      const [field, dir] = sort.split(':');
      const direction = dir && dir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      order = [[field, direction]];
    }

    const offset = (Math.max(Number(page), 1) - 1) * Number(limit);

    const { rows: items, count: total } = await Item.findAndCountAll({
      where,
      order,
      limit: Number(limit),
      offset,
    });

    res.status(200).json({
      data: items,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    logger.error('Error fetching items', err);
    res.status(500).json({ error: 'Failed to fetch items', details: err.message });
  }
}

/**
 * GET /items/:id
 */
export async function getItemById(req, res) {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json(item);
  } catch (err) {
    logger.error('Error fetching item by id', err);
    res.status(500).json({ error: 'Failed to fetch item', details: err.message });
  }
}

/**
 * POST /items
 * Body: { name, price, description?, picture?, category? }
 */
export async function createItem(req, res) {
  try {
    const { name, price, description, picture, category } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (price == null || Number.isNaN(Number(price))) return res.status(400).json({ error: 'Valid price is required' });

    const newItem = await Item.create({
      name: String(name).trim(),
      price: Number(price),
      description: description ?? null,
      picture: picture ?? null,
      category: category ?? null,
    });

    logger.info(`Item created: id=${newItem.id}`);
    res.status(201).json(newItem);
  } catch (err) {
    logger.error('Error creating item', err);
    res.status(400).json({ error: 'Failed to create item', details: err.message });
  }
}

/**
 * PUT/PATCH /items/:id
 * - Partial updates allowed
 */
export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Prevent updating primary key
    delete updates.id;

    // If price provided, validate
    if (updates.price !== undefined && (updates.price === null || Number.isNaN(Number(updates.price)))) {
      return res.status(400).json({ error: 'price must be a valid number' });
    }

    // Normalize strings if present
    if (updates.name) updates.name = String(updates.name).trim();
    if (updates.category) updates.category = String(updates.category).trim();

    const [affected] = await Item.update(updates, { where: { id } });
    if (!affected) return res.status(404).json({ error: 'Item not found' });

    const updated = await Item.findByPk(id);
    logger.info(`Item updated: id=${id}`);
    res.status(200).json(updated);
  } catch (err) {
    logger.error('Error updating item', err);
    res.status(400).json({ error: 'Failed to update item', details: err.message });
  }
}

/**
 * DELETE /items/:id
 */
export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    await item.destroy();
    logger.info(`Item deleted: id=${id}`);
    res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    logger.error('Error deleting item', err);
    res.status(500).json({ error: 'Failed to delete item', details: err.message });
  }
}

/**
 * PATCH /items/:id/stock
 * Body: { delta: number }  -> increases (positive) or decreases (negative) stock/quantity
 * NOTE: This requires your Item model to have a `stock` or `quantity` column.
 * If you use InventoryItem for quantities, implement inventory controller instead.
 */
export async function adjustItemStock(req, res) {
  try {
    const { id } = req.params;
    const { delta } = req.body;
    if (delta === undefined || Number.isNaN(Number(delta))) {
      return res.status(400).json({ error: 'delta (number) is required' });
    }
    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    // if your model uses `quantity` or `stock`, adapt this:
    const field = item.quantity !== undefined ? 'quantity' : (item.stock !== undefined ? 'stock' : null);
    if (!field) {
      return res.status(400).json({ error: 'Item model has no quantity/stock field to adjust' });
    }

    const newVal = (Number(item[field] || 0) + Number(delta));
    if (newVal < 0) return res.status(400).json({ error: 'Resulting stock cannot be negative' });

    item[field] = newVal;
    await item.save();

    logger.info(`Adjusted stock for item ${id} by ${delta}, new ${field}=${newVal}`);
    res.status(200).json(item);
  } catch (err) {
    logger.error('Error adjusting item stock', err);
    res.status(500).json({ error: 'Failed to adjust stock', details: err.message });
  }
}

export default {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  adjustItemStock,
};
