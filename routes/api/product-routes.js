const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try{
    const prodMd = await Product.findAll({
        include: [{
            model: Category,
            attributes: ['id', 'category_name']
          },
          {
            model: Tag,
            attributes: ['id', 'tag_name']
          }
        ]
      })
      res.status(200).json(prodMd);
    }catch(err){
        res.status(500).json(err);
      };
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const prodMd = await Product.findOne({
        where: {
          id: req.params.id
        },
        include: [{
          model: Category,
          attributes: ['id', 'category_name']
        },
      {
        model: Tag,
        attributes:['id', 'tag_name']
      }]
      });
      if (!Product) {
        res.status(404).json({
          message: 'Product with id ' + req.params.id + ' not found!'
        });
        return;
      }
  
      res.status(200).json(prodMd);
    } catch (err) {
      res.status(500).json(err);
    }
});

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const prodTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(prodTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((prodTagIds) => res.status(200).json(prodTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((ProductTag) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((product) => {
      // get list of current tag_ids
      const prodTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProdTags = req.body.tagIds
        .filter((tag_id) => !prodTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const prodTagsToRemove = ProductTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: prodTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const prodMd = await Product.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!prodMd) {
      res.status(404).json({
        message: 'Product with id ' + req.params.id + ' not found!'
      });
      return;
    }

    res.status(200).json(prodMd);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
