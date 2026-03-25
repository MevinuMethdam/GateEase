import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);
            const { token, role, name } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);
            localStorage.setItem('userName', name);

            // 🌟 FIX: අලුත් Maintenance Role එකට වෙනම පාරක් හැදුවා
            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'resident') {
                navigate('/resident');
            } else if (role === 'maintenance') {
                navigate('/maintenance-staff');
            } else {
                navigate('/');
            }

        } catch (error) {
            alert(`❌ ${error.response?.data?.message || 'Login Failed! Please check your credentials.'}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />

            <div className="w-full max-w-md bg-dark-card p-8 rounded-3xl border border-white/5 shadow-2xl relative z-10">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-text">Sign in to manage your apartment</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                className="w-full bg-dark-input text-white pl-11 pr-4 py-3.5 rounded-xl border border-white/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-600"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-dark-input text-white pl-11 pr-12 py-3.5 rounded-xl border border-white/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-600"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(192,222,24,0.3)]"
                    >
                        <span>Sign In</span>
                        <ArrowRight className="h-5 w-5" />
                    </button>

                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    Forgot your password? <a href="#" className="text-primary hover:underline">Reset here</a>
                </p>
            </div>
        </div>
    );
};

export default Login;