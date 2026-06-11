import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const ApiTest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const testProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL + "/products/");
      const data = await response.json();
      setResult({ success: true, data: Array.isArray(data) ? data.slice(0, 3) : data });
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    if (!email || !password) {
      setResult({ success: false, error: 'Please enter email and password' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_URL + "/users/login/", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        setResult({ success: true, data: { user: data.user, token: data.access?.substring(0, 50) + '...' } });
      } else {
        setResult({ success: false, error: data.error || 'Login failed' });
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setResult({ success: false, error: 'Please login first' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_URL + "/cart/", {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      const data = await response.json();
      setResult({ success: true, data });
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>API Connection Test</h1>
      <p>Backend URL: <code>{API_URL}</code></p>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h3>Test Login</h3>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '8px', marginRight: '8px', width: '200px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '8px', marginRight: '8px', width: '150px' }}
        />
        <button onClick={testLogin} disabled={loading} style={styles.btn}>Test Login</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={testProducts} disabled={loading} style={styles.btn}>Test Products API</button>
        <button onClick={testCart} disabled={loading} style={styles.btn}>Test Cart API</button>
      </div>

      {result && (
        <pre style={styles.result}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

      <div style={{ marginTop: '1rem', fontSize: '14px', color: '#6b7280' }}>
        <p>Test Accounts:</p>
        <ul>
          <li>Buyer: student@campus.com / Test123!</li>
          <li>Seller: seller@campus.com / Test123!</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  btn: { padding: '10px 20px', backgroundColor: '#eab308', border: 'none', borderRadius: '8px', cursor: 'pointer', margin: '4px' },
  result: { backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '8px', overflow: 'auto', maxHeight: '400px', fontSize: '12px' },
};

export default ApiTest;
