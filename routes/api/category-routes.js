const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const catMd = await Category.findAll({
      include: [{
        model: Product,
        attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
      }]
    })
    res.status(200).json(catMd);
  } catch (err) {
    res.status(500).json(err);
  };
});

router.get('/:id', async (req, res) => {
 // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const catMd = await Category.findOne({ 
      where: {
        id: req.params.id
      },
      include: [{
        model: Product,
        attributes: ['id', 'product_name', 'price', 'stock', 'category_id']
      }]
    });
    if(!catMd) {
      res.status(404).json({
       message: 'Category with id ' + req.params.id +  ' not found!' 
      })
    }
    res.status(200).json(catMd);
  }catch(err) {
    res.status(500).json(err); 
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    const catMd = await Category.create(req.body);
    res.status(200).json(catMd);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    const catMd = await Category.update({
      category_name: req.body.category_name,
    }, {
      where: {
        id: req.params.id
      }
    });

    if (!catMd) {
      res.status(404).json({
        message: 'Category with id ' + req.params.id +  ' not found!'
      });
      return;
    }

    res.status(200).json(catMd);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const catMd = await Category.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!catMd) {
      res.status(404).json({
        message: 'Category with id ' + req.params.id +  ' not found!'
      });
      return;
    }

    res.status(200).json(catMd);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
