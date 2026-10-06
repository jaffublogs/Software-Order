import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, Check, Upload, Trash2, ArrowRight } from 'lucide-react';
import { products, categories } from './data';
import './index.css';

// Components
const Navbar = ({ cartItemCount }) => (
  <nav className="navbar">
    <div className="container">
      <Link to="/" className="logo">IMRAN SOFTWARES</Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/products">All Products</Link>
        <Link to="/cart" className="cart-icon">
          <ShoppingCart size={24} />
          {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
        </Link>
      </div>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <p>&copy; 2026 Imran Softwares. All Rights Reserved.</p>
    </div>
  </footer>
);

const ProductCard = ({ product }) => (
  <div className="product-card">
    <Link to={`/product/${product.id}`}>
      <img src={product.image} alt={product.name} className="product-img" />
    </Link>
    <div className="product-info">
      <div className="product-category">{product.category}</div>
      <h3 className="product-title">
        <Link to={`/product/${product.id}`}>{product.name}</Link>
      </h3>
      <div className="product-price-row">
        <span className="price">₹{product.price}</span>
        <span className="original-price">₹{product.originalPrice}</span>
      </div>
      <Link to={`/product/${product.id}`} className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
        View Details
      </Link>
    </div>
  </div>
);

// Pages
const Home = () => (
  <div>
    <div className="hero">
      <div className="container">
        <h1>Premium Pre-Activated Software</h1>
        <p>Get lifetime valid software delivered instantly to your Google Drive. 100% secure and authentic.</p>
        <Link to="/products" className="btn-primary">Shop Now</Link>
      </div>
    </div>
    <div className="products-section container">
      <h2 className="section-title">Featured Products</h2>
      <div className="product-grid">
        {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  </div>
);

const AllProducts = () => {
  const [activeCat, setActiveCat] = useState("All");
  
  const filtered = activeCat === "All" ? products : products.filter(p => p.category === activeCat);
  
  return (
    <div className="container page-container">
      <h1 className="section-title">All Products</h1>
      <div className="filters">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-btn ${activeCat === cat ? 'active' : ''}`}
            onClick={() => setActiveCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="product-grid">
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
};

const ProductDetail = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === parseInt(id));
  
  if (!product) return <div className="container page-container">Product not found</div>;
  
  const handleAddToCart = () => {
    addToCart(product);
    navigate('/cart');
  };
  
  return (
    <div className="container page-container">
      <div className="product-detail-layout">
        <div>
          <img src={product.image} alt={product.name} className="product-detail-img" />
        </div>
        <div className="product-detail-info">
          <div className="product-category">{product.category}</div>
          <h1>{product.name}</h1>
          <div className="product-price-row" style={{ fontSize: '1.2em', marginBottom: '20px' }}>
            <span className="price" style={{ fontSize: '32px' }}>₹{product.price}</span>
            <span className="original-price">₹{product.originalPrice}</span>
          </div>
          <p className="desc">{product.description}</p>
          <ul style={{ marginBottom: '30px', paddingLeft: '20px', color: 'var(--text-muted)' }}>
            <li>Lifetime Validity</li>
            <li>Pre-Activated (No Key Required)</li>
            <li>Instant Google Drive Access</li>
            <li>Virus Free & 100% Safe</li>
          </ul>
          <button className="btn-primary" onClick={handleAddToCart} style={{ width: '100%', padding: '15px' }}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const Cart = ({ cart, removeFromCart }) => {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  
  if (cart.length === 0) {
    return (
      <div className="container page-container" style={{ textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <p style={{ margin: '20px 0', color: 'var(--text-muted)' }}>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }
  
  return (
    <div className="container page-container">
      <h1>Your Cart</h1>
      <div className="product-detail-layout" style={{ marginTop: '30px' }}>
        <div>
          {cart.map((item, index) => (
            <div key={index} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="price">₹{item.price}</p>
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(index)}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
        <div>
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div style={{ marginTop: '20px' }}>
              <div className="summary-item">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span className="price">₹{total}</span>
              </div>
            </div>
            <button className="btn-primary" onClick={() => navigate('/checkout')} style={{ width: '100%', marginTop: '20px' }}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = ({ cart, setCustomerInfo }) => {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setCustomerInfo({
      name: formData.get('name'),
      email: formData.get('email'),
      whatsapp: formData.get('whatsapp')
    });
    navigate('/payment');
  };
  
  return (
    <div className="container page-container">
      <h1>Checkout</h1>
      <div className="product-detail-layout" style={{ marginTop: '30px' }}>
        <div>
          <div className="order-summary">
            <h3 style={{ marginBottom: '20px' }}>Customer Information</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" required placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Email (Google Drive access will be sent here)</label>
                <input type="email" name="email" required placeholder="john@gmail.com" />
              </div>
              <div className="form-group">
                <label>WhatsApp Number</label>
                <input type="text" name="whatsapp" required placeholder="+91 9876543210" />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Continue to Payment
              </button>
            </form>
          </div>
        </div>
        <div>
          <div className="order-summary">
            <h3>Order Details</h3>
            <div style={{ marginTop: '20px' }}>
              {cart.map((item, i) => (
                <div key={i} className="summary-item" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  <span>{item.name}</span>
                  <span>₹{item.price}</span>
                </div>
              ))}
              <div className="summary-total">
                <span>Total to Pay</span>
                <span className="price">₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Payment = ({ cart }) => {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  
  return (
    <div className="container page-container">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center' }}>Complete Your Payment</h1>
        <div className="payment-qr">
          <h3>Scan and Pay with any UPI App</h3>
          <p style={{ color: 'var(--text-muted)', margin: '10px 0' }}>Paytm, PhonePe, GPay, BHIM</p>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=imran@upi&pn=ImranSoftwares&am=${total}&cu=INR`} alt="UPI QR Code" />
          <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '20px 0' }}>₹{total}</div>
          <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>UPI ID: imran@upi</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button className="btn-primary" onClick={() => navigate('/submit-utr')} style={{ width: '100%' }}>
            I have made the payment <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: '5px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

const SubmitUTR = ({ clearCart, cart, customerInfo }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataUI = new FormData(e.target);
    const utr = formDataUI.get('utr');
    
    setLoading(true);

    try {
      const data = new FormData();
      data.append('email', customerInfo.email);
      data.append('name', customerInfo.name);
      data.append('whatsapp', customerInfo.whatsapp);
      data.append('utr', utr);
      data.append('cartData', JSON.stringify(cart));
      data.append('total', total);
      if (screenshot) {
        data.append('screenshot', screenshot);
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
      await fetch(`${backendUrl}/api/send-invoice`, {
        method: 'POST',
        body: data
      });
    } catch (err) {
      console.error("Failed to send email API request", err);
    }
    
    setLoading(false);
    clearCart();
    navigate('/order-success');
  };
  
  return (
    <div className="container page-container">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Verify Payment</h1>
        <div className="order-summary">
          <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
            Please provide your transaction details. Once you submit, we will email your invoice directly to <strong>{customerInfo?.email || 'your email'}</strong>.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>12-Digit UTR / Transaction Reference Number</label>
              <input type="text" name="utr" required placeholder="e.g. 312412345678" />
            </div>
            <div className="form-group">
              <label>Upload Payment Screenshot</label>
              <label style={{ 
                border: screenshot ? '2px solid var(--success)' : '2px dashed var(--border-color)', 
                padding: '40px', 
                textAlign: 'center', 
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '20px',
                display: 'block',
                background: screenshot ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
              }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
                <Upload size={32} style={{ color: screenshot ? 'var(--success)' : 'var(--text-muted)', marginBottom: '10px' }} />
                <p style={{ color: screenshot ? 'var(--success)' : 'var(--text-muted)', fontWeight: screenshot ? 'bold' : 'normal' }}>
                  {screenshot ? screenshot.name : 'Click to upload screenshot'}
                </p>
              </label>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending Invoice...' : 'Submit Order & Receive Invoice'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const OrderSuccess = () => (
  <div className="container page-container" style={{ textAlign: 'center', paddingTop: '60px' }}>
    <div style={{ 
      width: '80px', 
      height: '80px', 
      backgroundColor: 'rgba(16, 185, 129, 0.1)', 
      color: 'var(--success)', 
      borderRadius: '50%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      margin: '0 auto 20px',
      boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
    }}>
      <Check size={40} />
    </div>
    <h1 style={{ marginBottom: '20px' }}>Order Submitted Successfully!</h1>
    <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 30px', fontSize: '18px' }}>
      Thank you for your purchase! We have sent the initial invoice to your email. Our admin is verifying your payment against your UTR.
    </p>
    <div className="order-summary" style={{ maxWidth: '400px', margin: '0 auto 30px', textAlign: 'left' }}>
      <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>Next Steps:</h3>
      <ol style={{ paddingLeft: '20px', color: 'var(--text-main)', lineHeight: '1.8' }}>
        <li>Admin verifies UTR & Payment (5-10 mins)</li>
        <li>Access granted to provided Gmail</li>
        <li>Check your email inbox / Google Drive</li>
        <li>Download & install your software</li>
      </ol>
    </div>
    <Link to="/" className="btn-secondary">Return to Home</Link>
  </div>
);

// Main App component
const App = () => {
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', whatsapp: '' });
  
  const addToCart = (product) => {
    setCart([...cart, product]);
  };
  
  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };
  
  const clearCart = () => {
    setCart([]);
  };

  return (
    <Router>
      <Navbar cartItemCount={cart.length} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} />} />
        <Route path="/checkout" element={<Checkout cart={cart} setCustomerInfo={setCustomerInfo} />} />
        <Route path="/payment" element={<Payment cart={cart} />} />
        <Route path="/submit-utr" element={<SubmitUTR clearCart={clearCart} cart={cart} customerInfo={customerInfo} />} />
        <Route path="/order-success" element={<OrderSuccess />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
