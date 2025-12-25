import Item from '../models/Item.js';

export const createItem = async (req, res) => {
    try {
        console.log("--- New Upload Attempt ---");
        console.log("User from Token:", req.user); // Check if this is undefined
        console.log("File from Multer:", req.file);

        const { title, description, price, category } = req.body;

        // Check if an image was actually uploaded
        if (!req.file) {
            return res.status(400).json({ message: "Please upload an image of the item" });
        }

        const newItem = await Item.create({
            title,
            description,
            price: Number(price),
            category,
            images: [req.file.path], // req.file.path is the Cloudinary URL
            seller: req.user.id      // Taken from our 'protect' middleware
        });

        res.status(201).json(newItem);
    } catch (error) {
       console.error("CRASH ERROR:", error); 
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message // Sends the actual error back to Postman
        });
       
    }
};

// Also adding a logic to "Get All Items" for the home page
export const getItems = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        // Filter by category if provided
        if (category) {
            query.category = category;
        }

        // Search by title if provided (case-insensitive)
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // .populate('seller', 'name email') joins the User data 
        // but only gives us the name and email for safety.
        const items = await Item.find(query)
            .populate('seller', 'name email') 
            .sort({ createdAt: -1 }); // Show newest items first

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('seller', 'name email');
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyItems = async (req, res) => {
    try {
        // req.user.id comes from the 'protect' middleware
        const items = await Item.find({ seller: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Check if the person deleting is the owner
        if (item.seller.toString() !== req.user.id) {
            return res.status(401).json({ message: "User not authorized to delete this item" });
        }

        await item.deleteOne();
        res.status(200).json({ message: "Item removed from marketplace" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateItemStatus = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) return res.status(404).json({ message: "Item not found" });

        if (item.seller.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        item.isSold = req.body.isSold; 
        await item.save();

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};