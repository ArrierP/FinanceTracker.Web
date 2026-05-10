import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

// Tách biệt logic và đảm bảo export đúng chuẩn Fast Refresh
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const defaultUser = authService.getCurrentUser();
        setUser(defaultUser);
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    // Dùng data.user nếu backend trả về bọc trong user, 
    // hoặc data nếu backend trả về thẳng object user
    const userToSet = data.user || data;
    setUser(userToSet);
    return data;
  };

  const register = async (email, password) => {
    return await authService.register(email, password);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Export hook ở cuối file
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};