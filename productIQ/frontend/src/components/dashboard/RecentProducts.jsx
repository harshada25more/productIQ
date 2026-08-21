import { Link } from "react-router-dom";

function RecentProducts({ products = [] }) {
  const displayProducts = products.length > 0 ? products : [];

  return (
    <div className="dashboard-card recent-products">
      <div className="card-heading">
        <div>
          <h3>Recent Products</h3>
          <p>Recently enriched catalog items</p>
        </div>

        <Link to="/products">View All</Link>
      </div>

      {displayProducts.length === 0 ? (
        <div className="empty-state-card">
          <p>No products in the catalog yet. Add your first product to get started!</p>
          <Link to="/add-product" className="primary-button" style={{ display: "inline-block", marginTop: "10px" }}>
            Add Product
          </Link>
        </div>
      ) : (
        <div className="product-table">
          <div className="table-row table-header">
            <span>Product</span>
            <span>SKU</span>
            <span>Confidence</span>
            <span>Status</span>
          </div>

          {displayProducts.map((product) => (
            <div className="table-row" key={product.id || product._id}>
              <span>
                <Link to={`/products/${product.id || product._id}`}>
                  <strong>{product.name}</strong>
                </Link>
              </span>

              <span>{product.sku || "N/A"}</span>

              <span>
                <strong>{product.confidence || 0}%</strong>
              </span>

              <span>
                <span
                  className={
                    product.status === "Validated"
                      ? "status validated"
                      : product.status === "Rejected"
                      ? "status rejected"
                      : "status review"
                  }
                >
                  {product.status || "Needs Review"}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentProducts;