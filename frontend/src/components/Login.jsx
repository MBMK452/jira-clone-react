import { useState } from 'react';
import { useStore } from '../store/useStore';

export default function Login() {
  const { login, register } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true); // Toggles the view

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="bg-white shadow-sm hover:shadow-md p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isLoginMode ? 'Login' : 'Register'}
        </h2>
        
        <input 
          type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border rounded focus:outline-none focus:border-blue-500" required
        />
        <input 
          type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 p-3 border rounded focus:outline-none focus:border-blue-500" required
        />
        
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 mb-4 transition">
          {isLoginMode ? 'Enter Workspace' : 'Create Account'}
        </button>
        
        <p className="text-center text-sm text-gray-600">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLoginMode(!isLoginMode)} 
            className="text-blue-600 font-semibold underline"
          >
            {isLoginMode ? 'Register here' : 'Login here'}
          </button>
        </p>
      </form>
    </div>
  );
}