const express = require("express");
const { body, validationResult } = require("express-validator");
const Product = require("../models/product");
const auth = require("../middleware/auth");

const router = express.Router();
/// GET /products
router.get("/", async (req, res, next) => {
  try {
    let page = req.query.page ? parseInt(req.query.page, 10) : null;
    let limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

    // If limit is not given → return ALL products
    if (!limit) {
      const allProducts = await Product.find()
        .sort({ createdAt: -1 })
        .select("_id name price");

      const formattedProducts = allProducts.map(p => ({
        id: p._id,
        name: p.name,
        price: p.price
      }));

      return res.json({
        page: 1,
        limit: formattedProducts.length,
        totalProducts: formattedProducts.length,
        totalPages: 1,
        products: formattedProducts
      });
    }

    // If limit is given → use pagination
    if (!page || page < 1) page = 1;
    const totalProducts = await Product.countDocuments();
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("_id name price");

    const formattedProducts = products.map(p => ({
      id: p._id,
      name: p.name,
      price: p.price
    }));

    res.json({
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      products: formattedProducts
    });
  } catch (err) {
    next(err);
  }
});




// GET product by id
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// CREATE product (protected)
router.post(
  "/",
  auth,
  [
    body("name").notEmpty().withMessage("name is required"),
    body("price").isFloat({ gt: 0 }).withMessage("price must be positive")
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }
);

// UPDATE product (protected)
router.put(
  "/:id",
  auth,
  [
    body("name").notEmpty().withMessage("name is required"),
    body("price").isFloat({ gt: 0 }).withMessage("price must be positive")
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json(product);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE product (protected)
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
