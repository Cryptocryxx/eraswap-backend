
// Items controller - similar structure and behavior to usersController
// Provides CRUD handlers for Item model

const Item = require('../models/item');

// Get all items
async function getAllItems(req, res) {
	try {
		const items = await Item.find();
		return res.status(200).json(items);
	} catch (err) {
		return res.status(500).json({ error: 'Failed to fetch items', details: err.message });
	}
}

// Get single item by id
async function getItemById(req, res) {
	try {
		const { id } = req.params;
		const item = await Item.findById(id);
		if (!item) return res.status(404).json({ error: 'Item not found' });
		return res.status(200).json(item);
	} catch (err) {
		return res.status(500).json({ error: 'Failed to fetch item', details: err.message });
	}
}

// Create new item
async function createItem(req, res) {
	try {
		const payload = req.body;
		const newItem = new Item(payload);
		const saved = await newItem.save();
		return res.status(201).json(saved);
	} catch (err) {
		return res.status(400).json({ error: 'Failed to create item', details: err.message });
	}
}

// Update existing item
async function updateItem(req, res) {
	try {
		const { id } = req.params;
		const updates = req.body;
		const updated = await Item.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
		if (!updated) return res.status(404).json({ error: 'Item not found' });
		return res.status(200).json(updated);
	} catch (err) {
		return res.status(400).json({ error: 'Failed to update item', details: err.message });
	}
}

// Delete item
async function deleteItem(req, res) {
	try {
		const { id } = req.params;
		const deleted = await Item.findByIdAndDelete(id);
		if (!deleted) return res.status(404).json({ error: 'Item not found' });
		return res.status(200).json({ message: 'Item deleted' });
	} catch (err) {
		return res.status(500).json({ error: 'Failed to delete item', details: err.message });
	}
}

module.exports = {
	getAllItems,
	getItemById,
	createItem,
	updateItem,
	deleteItem,
};
