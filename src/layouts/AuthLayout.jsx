import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(to right bottom, rgba(79, 70, 229, 0.9), rgba(16, 185, 129, 0.8))" }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-4xl font-extrabold text-white">
          Finance Tracker
        </h2>
        <p className="mt-2 text-center text-sm text-indigo-100">
          Simplify your personal finances today.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
