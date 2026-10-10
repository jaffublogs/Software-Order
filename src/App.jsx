import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { ShoppingCart, Check, Upload, Trash2, ArrowRight, Mail, Send, Phone, Search, Menu, X } from 'lucide-react';
import { products, categories } from './data';
import './index.css';

// Components
const Navbar = ({ cartItemCount, cartTotal }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="nav-top-row">
          <div className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} color="#fff" /> : <Menu size={28} color="#fff" />}
          </div>
          
          <Link to="/" className="logo-container" style={{ flexDirection: 'row', alignItems: 'center' }}>
            <span className="logo-text" style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px' }}>
              <span style={{ color: '#00f2fe', textShadow: '0 0 15px rgba(0,242,254,0.4)' }}>Imran </span>
              <span style={{ color: '#ffffff' }}>Softkart</span>
            </span>
          </Link>
          
          <div className="nav-actions">
            <div className="search-icon hide-on-mobile">
              <Search size={20} color="#fff" />
            </div>
            <div className="nav-divider hide-on-mobile"></div>
            <Link to="/cart" className="cart-action">
              <span className="cart-price hide-on-mobile">₹{cartTotal ? cartTotal.toFixed(2) : '0.00'}</span>
              <div className="cart-icon-wrapper">
                <ShoppingCart size={22} color="#fcd34d" />
                <span className="cart-badge">{cartItemCount}</span>
              </div>
            </Link>
          </div>
        </div>

        <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>HOME</Link>
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>ABOUT</Link>
          <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>ALL PRODUCTS</Link>
          <Link to="/faqs" onClick={() => setIsMobileMenuOpen(false)}>FAQS</Link>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>CONTACT US</Link>
        </div>
      </div>
    </nav>
  );
};



const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div style={{ marginBottom: '25px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'inline-block' }}>
        <h3 style={{ color: '#fff', marginBottom: '20px' }}>Contact Admin</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '25px' }}>
          <a href="mailto:jaffuvlogs@gmail.com" title="Email Admin" style={{ color: 'var(--primary)', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', transition: 'all 0.3s ease', boxShadow: '0 0 10px rgba(0, 242, 254, 0.1)' }}>
            <Mail size={24} />
          </a>
          <a href="https://t.me/mistersystemservice" target="_blank" rel="noopener noreferrer" title="Telegram Admin" style={{ color: 'var(--primary)', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', transition: 'all 0.3s ease', boxShadow: '0 0 10px rgba(0, 242, 254, 0.1)' }}>
            <Send size={24} />
          </a>
          <a href="tel:+917661869592" title="Call Admin" style={{ color: 'var(--primary)', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', transition: 'all 0.3s ease', boxShadow: '0 0 10px rgba(0, 242, 254, 0.1)' }}>
            <Phone size={24} />
          </a>
        </div>
      </div>
      <p>&copy; {new Date().getFullYear()} Imran Softwares. All Rights Reserved.</p>
    </div>
  </footer>
);

const ProductCard = ({ product }) => (
  <div className="product-card">
    <Link to={`/product/${product.id}`}>
      <img src={product.image} alt={product.name} className="product-img" />
    </Link>
    <div className="product-info">
      <div className="product-category">PRE-ACTIVATED</div>
      <h3 className="product-title">
        <Link to={`/product/${product.id}`}>{product.name}</Link>
      </h3>
      <div className="product-price-row">
        <span className="original-price">₹{product.originalPrice}</span>
        <span className="price">₹{product.price}</span>
      </div>
    </div>
  </div>
);

// Pages
const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div>
      <div style={{ padding: '80px 20px 40px' }}>
        <div style={{ display: 'flex', maxWidth: '1000px', margin: '0 auto', height: '80px' }}>
          <input 
            type="text" 
            placeholder="Type to start searching..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, padding: '0 30px', fontSize: '20px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', outline: 'none' }} 
          />
          <button 
            onClick={handleSearch}
            style={{ background: 'var(--primary-gradient)', color: '#000', border: 'none', padding: '0 40px', fontSize: '22px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase' }}>
            Search
          </button>
        </div>
      </div>
      <div className="products-section container">
        <h2 className="section-title">Featured Products</h2>
        <div className="product-grid">
          {products.slice(0, 5).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
};

const AllProducts = () => {
  const [activeCat, setActiveCat] = useState("All");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';
  
  const filtered = products.filter(p => {
    const matchesCat = activeCat === "All" || p.category === activeCat;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });
  
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
    navigate('/instructions');
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

const PaymentInstructions = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="container page-container">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>How to Purchase & Download (A-Z)</h1>
        <div className="order-summary" style={{ textAlign: 'left', padding: '30px' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '20px', borderBottom: '1px solid rgba(0, 242, 254, 0.2)', paddingBottom: '10px' }}>Please read these instructions carefully:</h3>
          <ul style={{ paddingLeft: '0', listStyleType: 'none', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <li>
              <strong style={{ color: '#fff', fontSize: '16px' }}>1. View the QR Code:</strong><br/>
              <span style={{ color: 'var(--text-muted)' }}>Click "Agree & Proceed" below. On the next screen, you will see our official UPI QR code.</span>
            </li>
            <li>
              <strong style={{ color: '#fff', fontSize: '16px' }}>2. Scan & Pay:</strong><br/>
              <span style={{ color: 'var(--text-muted)' }}>Open your UPI app (Google Pay, PhonePe, Paytm, etc.) and scan the QR code to pay the exact amount.</span>
            </li>
            <li>
              <strong style={{ color: '#fff', fontSize: '16px' }}>3. Take a Screenshot (Important):</strong><br/>
              <span style={{ color: 'var(--text-muted)' }}>After the payment is successful, take a screenshot. <strong>Make sure the UTR / Transaction ID is visible.</strong></span>
            </li>
            <li>
              <strong style={{ color: '#fff', fontSize: '16px' }}>4. Upload the Screenshot:</strong><br/>
              <span style={{ color: 'var(--text-muted)' }}>Click the "I have made the payment" button below the QR code and upload your screenshot on the submission page.</span>
            </li>
            <li>
              <strong style={{ color: '#fff', fontSize: '16px' }}>5. Automated Email & Verification:</strong><br/>
              <span style={{ color: 'var(--text-muted)' }}>As soon as you submit, you will instantly receive an email. Our team will verify the payment within minutes.</span>
            </li>
            <li>
              <strong style={{ color: '#fff', fontSize: '16px' }}>6. Get Software Access:</strong><br/>
              <span style={{ color: 'var(--text-muted)' }}>Inside your confirmation email, you will find a Google Drive link. Simply click it to <strong>request access</strong>. Our Admin will check your payment verification and then instantly give you Drive access to download the software!</span>
            </li>
          </ul>
          
          <div style={{ marginTop: '30px', padding: '15px', backgroundColor: 'rgba(0, 242, 254, 0.05)', borderRadius: '8px', border: '1px solid rgba(0, 242, 254, 0.2)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <input 
              type="checkbox" 
              id="agree-terms" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: '4px', width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="agree-terms" style={{ cursor: 'pointer', color: '#fff', lineHeight: '1.5', fontSize: '15px' }}>
              I have read and understood all the steps above. I know how to pay and submit the transaction screenshot to receive my software.
            </label>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '25px', justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={() => navigate('/checkout')} style={{ flex: '1', padding: '15px' }}>
              Deny (Go Back)
            </button>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/payment')} 
              disabled={!agreed}
              style={{ flex: '1', padding: '15px', opacity: agreed ? 1 : 0.5, cursor: agreed ? 'pointer' : 'not-allowed' }}
            >
              Agree & Proceed
            </button>
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
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=shaikjaffaralli1@ybl&pn=ImranSoftwares&am=${total}&cu=INR`)}`} alt="UPI QR Code" />
          <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '20px 0' }}>₹{total}</div>
          <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>UPI ID: shaikjaffaralli1@ybl</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button className="btn-primary" onClick={() => navigate('/submit-payment')} style={{ width: '100%' }}>
            I have made the payment <ArrowRight size={18} style={{ verticalAlign: 'middle', marginLeft: '5px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

const SubmitPayment = ({ clearCart, cart, customerInfo }) => {
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
    const driveEmail = customerInfo.email;
    
    setLoading(true);

    try {
      const data = new FormData();
      data.append('email', customerInfo.email);
      data.append('name', customerInfo.name);
      data.append('whatsapp', customerInfo.whatsapp);
      data.append('driveEmail', driveEmail);
      data.append('cartData', JSON.stringify(cart));
      data.append('total', total);
      if (screenshot) {
        data.append('screenshot', screenshot);
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');
      
      // Fire and forget - do not await so the UI responds instantly
      fetch(`${backendUrl}/api/send-invoice`, {
        method: 'POST',
        body: data
      }).catch(err => console.error("Background upload failed:", err));
      
    } catch (err) {
      console.error("Failed to prepare API request", err);
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
      Thank you for your purchase! We have sent the initial invoice to your email. Our admin is verifying your payment.
    </p>
    <div className="order-summary" style={{ maxWidth: '400px', margin: '0 auto 30px', textAlign: 'left' }}>
      <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>Next Steps:</h3>
      <ol style={{ paddingLeft: '20px', color: 'var(--text-main)', lineHeight: '1.8' }}>
        <li>Admin verifies Payment (5-10 mins)</li>
        <li>Access granted to provided Google Drive Email</li>
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
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
    });
  };
  
  const removeFromCart = (index) => {
    const newCart = [...cart];
    const removedItem = newCart.splice(index, 1)[0];
    setCart(newCart);
    toast.error(`${removedItem.name} removed`, {
      style: { border: '1px solid #ef4444' }
    });
  };
  
  const clearCart = () => {
    setCart([]);
  };

  return (
    <Router>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'rgba(30, 41, 59, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 242, 254, 0.2)'
          },
        }}
      />
      <Navbar cartItemCount={cart.length} cartTotal={cart.reduce((total, item) => total + item.price, 0)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<AllProducts />} />
        <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} />} />
        <Route path="/checkout" element={<Checkout cart={cart} setCustomerInfo={setCustomerInfo} />} />
        <Route path="/instructions" element={<PaymentInstructions />} />
        <Route path="/payment" element={<Payment cart={cart} />} />
        <Route path="/submit-payment" element={<SubmitPayment clearCart={clearCart} cart={cart} customerInfo={customerInfo} />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/about" element={<About />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </Router>
  );
};

// Simple functional pages for the new nav links
const About = () => (
  <div className="container page-container" style={{ minHeight: '50vh', textAlign: 'center', paddingTop: '100px' }}>
    <h1 className="section-title">About Imran Softkart</h1>
    <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
      We are dedicated to providing you with premium, pre-activated software with lifetime validity. Our goal is to make professional software accessible and easy to install for everyone.
    </p>
  </div>
);

const Faqs = () => (
  <div className="container page-container" style={{ minHeight: '50vh', textAlign: 'center', paddingTop: '100px' }}>
    <h1 className="section-title">Frequently Asked Questions</h1>
    <div style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
      <h3 style={{ color: '#fff', marginBottom: '10px' }}>Q: How do I receive my software?</h3>
      <p style={{ marginBottom: '20px' }}>A: After successful payment verification, you will receive an email granting you direct access to download the software from Google Drive.</p>
      
      <h3 style={{ color: '#fff', marginBottom: '10px' }}>Q: Are the licenses lifetime?</h3>
      <p>A: Yes, all our software comes pre-activated and is valid for a lifetime without any subscription fees.</p>
    </div>
  </div>
);

const Contact = () => (
  <div className="container page-container" style={{ minHeight: '50vh', textAlign: 'center', paddingTop: '100px' }}>
    <h1 className="section-title">Contact Support</h1>
    <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '30px' }}>
      Have an issue with your order? Our support team is here to help!
    </p>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <a href="mailto:jaffuvlogs@gmail.com" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={20} /> Email Us</a>
      <a href="https://t.me/mistersystemservice" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#0088cc', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}><Send size={20} /> Telegram Support</a>
      <a href="tel:+917661869592" className="btn-primary" style={{ background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={20} /> Call Us</a>
    </div>
  </div>
);

export default App;
