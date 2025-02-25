const API_URL = 'https://localhost:7291/api';
const ALLOWED_ORIGINS = [
  'https://localhost:7291',
  'http://localhost:3000',
  'http://localhost:4200',
  'http://localhost:4201',
  'http://dev.aws.averisource.com'
];

export const initiateSamlLogin = () => {
  return new Promise((resolve, reject) => {
    let messageReceived = false;
    
    // Store the resolve/reject functions in sessionStorage to access them when the login completes
    sessionStorage.setItem('samlLoginResolve', 'pending');
    
    // Open in new tab
    window.open(`${API_URL}/saml/proxy-login`, '_blank');

    // Set up message listener
    const handleMessage = (event) => {
      console.log('Received message from:', event.origin);
      console.log('Message data:', event.data);

      if (!ALLOWED_ORIGINS.includes(event.origin)) {
        console.log('Message received from unexpected origin:', event.origin);
      }

      if (event.data) {
        messageReceived = true;
        window.removeEventListener('message', handleMessage);
        resolve(event.data);
      }
    };

    window.addEventListener('message', handleMessage);

    // Check sessionStorage periodically for login result
    const checkLogin = setInterval(() => {
      const loginResult = sessionStorage.getItem('samlLoginResult');
      if (loginResult) {
        clearInterval(checkLogin);
        window.removeEventListener('message', handleMessage);
        sessionStorage.removeItem('samlLoginResult');
        sessionStorage.removeItem('samlLoginResolve');
        
        if (loginResult === 'error') {
          reject(new Error('LOGIN_FAILED'));
        } else {
          resolve(JSON.parse(loginResult));
        }
      }
    }, 500);
  });
};

export const initiateSamlLogout = async (userEmail) => {
  if (!userEmail) {
    console.warn('No email provided for logout');
    userEmail = JSON.parse(localStorage.getItem('user'))?.email || '';
  }

  const url = `${API_URL}/saml/proxy-logout?email=${encodeURIComponent(userEmail)}`;
  
  return new Promise((resolve, reject) => {
    // Store the resolve function in sessionStorage
    sessionStorage.setItem('samlLogoutResolve', 'pending');
    
    // Open logout in new tab
    window.open(url, '_blank');

    // Check sessionStorage periodically for logout result
    const checkLogout = setInterval(() => {
      const logoutResult = sessionStorage.getItem('samlLogoutResult');
      if (logoutResult) {
        clearInterval(checkLogout);
        sessionStorage.removeItem('samlLogoutResult');
        sessionStorage.removeItem('samlLogoutResolve');
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        resolve(true);
      }
    }, 500);
  });
};