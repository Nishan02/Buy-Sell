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
        const { search, category, minPrice, maxPrice, sortBy } = req.query;
        let query = {};

        // 1. Partial Search Logic (The Fix)
        if (search) {
            // This matches the search string anywhere in the title or description
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // 2. Category Filter
        if (category) query.category = category;

        // 3. Price Filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // 4. Sorting Logic
        let sortOptions = { createdAt: -1 };
        if (sortBy === 'priceLow') sortOptions = { price: 1 };
        if (sortBy === 'priceHigh') sortOptions = { price: -1 };

        const items = await Item.find(query)
            .populate('seller', 'name email')
            .sort(sortOptions);

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

export const getMyListings = async (req, res) => {
    try {
        // req.user.id comes from your 'protect' middleware
        const myItems = await Item.find({ seller: req.user.id }).sort({ createdAt: -1 });
        
        res.status(200).json({
            count: myItems.length,
            items: myItems
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch your listings", error: error.message });
    }
};

export const toggleSoldStatus = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Security Check
        if (item.seller.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Toggle the current boolean value
        item.isSold = !item.isSold;
        await item.save();

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // 1. Build the update object from req.body (Multer populates this)
    const updateData = {
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
    };

    // 2. Only update the image if a NEW file was actually uploaded
    if (req.file) {
      // Use req.file.path if using Cloudinary, or req.file.filename if local
      updateData.images = [req.file.path || req.file.secure_url];
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Server error during update" });
  }
};
