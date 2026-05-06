import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaTicketAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/90 backdrop-blur-lg shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
                    <Link to="/" className="text-gray-900 text-2xl font-black flex items-center gap-2 tracking-tight">
                        <span className="w-9 h-9 rounded-xl bg-gray-900 text-white inline-flex items-center justify-center">
                            <FaTicketAlt />
                        </span>
                        EventNest
                    </Link>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                        <Link to="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition">Events</Link>
                        {user ? (
                            <>
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition">Dashboard</Link>
                                <button onClick={handleLogout} className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-semibold transition">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition">Login</Link>
                                <Link to="/register" className="bg-gray-900 text-white hover:bg-black px-4 py-2 rounded-lg font-semibold transition">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
