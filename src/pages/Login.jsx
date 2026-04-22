import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // 1. Lấy dữ liệu lỗi từ Backend
      const backendData = err.response?.data;
      let finalError = 'Failed to login. Please check your credentials.';

      // 2. Phân tích Object lỗi để lấy ra chuỗi (String)
      if (typeof backendData === 'string') {
        finalError = backendData;
      } else if (backendData?.message) {
        finalError = backendData.message;
      } else if (backendData?.error) {
        finalError = backendData.error;
      } else if (backendData?.errors) {
        // Trường hợp lỗi Validation từ DTO (như cái MinLength(6) của bạn)
        finalError = Object.values(backendData.errors).flat().join(', ');
      }

      // 3. Chỉ lưu STRING vào state
      setError(finalError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800">Welcome Back</h3>
        <p className="text-sm text-slate-500">Please enter your details to sign in.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="email"
              required
              className="input-field pl-10"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="password"
              required
              className="input-field pl-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex justify-center items-center gap-2 mt-6"
        >
          {loading ? 'Signing in...' : (
            <>
              Sign In <LogIn className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-slate-500">Don't have an account? </span>
        <Link to="/register" className="font-medium text-primary hover:text-primary-hover">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;
