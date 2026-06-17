const express =
require("express");

const router =
express.Router();

const productController =
require("../controllers/product.controller");

const authMiddleware =
require("../middleware/auth.middleware");

const roleMiddleware =
require("../middleware/role.middleware");

router.get(
  "/",
  productController.getAll
);

router.get(
  "/search",
  productController.search
);

router.get(
  "/:id",
  (req, res, next) => {
    console.log("Route getById id:", req.params.id);
    next();
  },
  productController.getById
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  productController.create
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  productController.update
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  productController.delete
);

module.exports =
router;
