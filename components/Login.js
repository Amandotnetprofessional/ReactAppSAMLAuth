import React, { useState } from 'react';
import { initiateSamlLogin, initiateSamlLogout } from '../Services/auth.service';

const Login = () => {
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSamlLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Initiating SAML login...');
      const response = await initiateSamlLogin();
      console.log('SAML login response:', response);

      if (!response) {
        throw new Error('No response received from SAML login');
      }

      // Handle both camelCase and PascalCase response properties
      const userData = {
        token: response.Token || response.token || 'N/A',
        email: response.Email || response.email || 'N/A',
        firstName: response.FirstName || response.firstName || '',
        lastName: response.LastName || response.lastName || '',
        roles: response.Roles || response.roles || []
      };

      console.log('Processed user data:', userData);

      // Validate required fields
      if (!userData.token || userData.token === 'N/A') {
        throw new Error('Invalid token received');
      }

      if (!userData.email || userData.email === 'N/A') {
        throw new Error('Invalid email received');
      }

      // Store user data
      setUser(userData);
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('Login successful!');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please try again.');
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const handleSamlLogout = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Pass the user's email to the logout function
      await initiateSamlLogout(user.email);
      
      // Clear local state
      setUser(null);
      console.log('Logout successful!');
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err.message || 'Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderUserInfo = () => {
    if (!user) return null;

    return (
      <div style={{ 
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '4px',
        marginTop: '20px'
      }}>
        <h2>Welcome, {user.firstName} {user.lastName}!</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Roles:</strong> {Array.isArray(user.roles) ? user.roles.join(', ') : 'No roles assigned'}</p>
        <div>
          <strong>Token:</strong>
          <pre style={{
            backgroundColor: '#eef',
            padding: '10px',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            maxWidth: '100%',
            margin: '10px 0',
            fontSize: '12px',
            border: '1px solid #ddd',
            lineHeight: '1.4'
          }}>
            {user.token}
          </pre>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(user.token);
                alert('Token copied to clipboard!');
              }}
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Copy Token
            </button>
            <button
              onClick={handleSamlLogout}
              disabled={loading}
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.65 : 1
              }}
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>SAML Authentication Test</h1>
      
      {!user ? (
        <>
          <button 
            onClick={handleSamlLogin}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              opacity: loading ? 0.65 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login with SAML'}
          </button>
          
          {error && (
            <div style={{ 
              color: 'red', 
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#ffebee',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
        </>
      ) : renderUserInfo()}
    </div>
  );
};

export default Login;