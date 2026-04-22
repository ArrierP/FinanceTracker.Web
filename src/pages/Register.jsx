import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(email, password);
      toast.success('Registration successful. Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800">Create an Account</h3>
        <p className="text-sm text-slate-500">Start managing your finances effectively.</p>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              required
              className="input-field pl-10"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div> */}

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
          {loading ? 'Creating account...' : (
            <>
              Sign Up <UserPlus className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-slate-500">Already have an account? </span>
        <Link to="/login" className="font-medium text-primary hover:text-primary-hover">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;
