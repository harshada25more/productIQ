const getProductInfo = (product) => {
  return {
    name: product.name,
    category: product.category,
    price: product.price,
  };
};

module.exports = {
  getProductInfo,
};