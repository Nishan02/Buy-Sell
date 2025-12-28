import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaStore } from "react-icons/fa";
import axios from 'axios';
import { toast } from 'react-toastify';

const Auth = () => {
  const navigate = useNavigate();

  // STATE: Toggle between Login and Signup
  const [isLogin, setIsLogin] = useState(true);

  // STATE: Track which step of Signup we are on (1 = Details, 2 = OTP)
  const [signupStep, setSignupStep] = useState(1);

  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  // STATE: Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  // STATE: UI Feedback
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // HELPER: Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear errors when user types
  };

  // LOGIC: Validate College Email
  const validateEmail = (email) => {
    // Regex matches: anything + @mnnit.ac.in
    const collegeRegex = /^[a-zA-Z0-9._%+-]+@mnnit\.ac\.in$/;
    return collegeRegex.test(email);
  };

  // LOGIC: Resend OTP
  const handleResendOtp = async () => {
    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/resend-otp', {
        email: formData.email
      });
      toast.success("New code sent! Check your email.");
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  // LOGIC: Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const API_URL = 'http://localhost:5000/api/auth'; 

    try {
      // --- LOGIN FLOW ---
      if (isLogin) {
        const response = await axios.post(`${API_URL}/login`, {
          email: formData.email,
          password: formData.password
        });

        // Save token and user info to LocalStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setLoading(false);
        toast.success('Logged in successfully!');
        navigate('/'); // Redirect to home
      }

      // --- SIGNUP FLOW (Step 1: Get Details / Send OTP) ---
      else if (signupStep === 1) {
        if (!validateEmail(formData.email)) {
          setError('Only @mnnit.ac.in emails are allowed.');
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }

        await axios.post(`${API_URL}/register`, {
          name: formData.fullName,
          email: formData.email,
          password: formData.password
        });

        setLoading(false);
        setSignupStep(2); // Move to OTP step
      }

      // --- SIGNUP FLOW (Step 2: Verify OTP) ---
      else if (signupStep === 2) {
        // Updated Endpoint to match your backend (/verify-otp)
        await axios.post(`${API_URL}/verify-otp`, {
          email: formData.email,
          otp: formData.otp
        });

        toast.success('Account created successfully!');
        setIsLogin(true); // Take them back to login
        setSignupStep(1);
        setLoading(false);
      }

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="absolute top-6 left-6">
         <Link to="/" className="flex items-center text-2xl font-bold text-indigo-600">
           <FaStore className="h-8 w-8 mr-2" />
           Campus<span className="text-gray-800">Mart</span>
         </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access the secure campus buy & sell goods
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          <form className="space-y-6" onSubmit={handleSubmit}>

            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            {/* --- SIGNUP ONLY: Full Name --- */}
            {!isLogin && signupStep === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1">
                  <input
                    name="fullName"
                    type="text"
                    required
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* --- BOTH: Email Address --- */}
            {signupStep === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  College Email
                </label>
                <div className="mt-1">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="name.regNo@mnnit.ac.in"
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* --- BOTH: Password --- */}
            {(isLogin || signupStep === 1) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={!isLogin ? "Create a strong password" : undefined}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {formData.password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  )}
                </div>
                {/* Forgot Password Link (Login Only) */}
                {isLogin && (
                    <div className="flex items-center justify-end mt-1">
                        <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                            Forgot your password?
                        </Link>
                    </div>
                )}
              </div>
            )}

            {/* --- SIGNUP ONLY: Confirm Password --- */}
            {!isLogin && signupStep === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="mt-1">
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* --- SIGNUP OTP STEP --- */}
            {!isLogin && signupStep === 2 && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  We sent a code to <b>{formData.email}</b>
                </p>
                <label className="block text-sm font-medium text-gray-700 text-left">Verification Code</label>
                <div className="mt-1">
                  <input
                    name="otp"
                    type="text"
                    maxLength="6"
                    placeholder="123456"
                    required
                    value={formData.otp}
                    onChange={handleChange}
                    className="text-center text-2xl tracking-widest appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                {/* Resend Code Link */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                    >
                      Resend Code
                    </button>
                  </p>
                </div>
              </div>
            )}

            {!isLogin && signupStep === 1 && (
              <div className="flex items-start gap-2 mt-4">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link to="/terms" className="text-green-600 hover:underline font-medium">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-green-600 hover:underline font-medium">Privacy Policy</Link>
                </label>
              </div>
            )}

            {/* --- SUBMIT BUTTON --- */}
            <div>
              <button
                type="submit"
                disabled={loading || (!isLogin && !agree && signupStep === 1)}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                  ${loading || (!isLogin && !agree && signupStep === 1)
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {loading
                  ? 'Processing...'
                  : isLogin
                    ? 'Sign in'
                    : signupStep === 1
                      ? 'Get Verification Code'
                      : 'Verify & Create Account'
                }
              </button>
            </div>

          </form>

          {/* --- TOGGLE LOGIN / SIGNUP --- */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? "New in this app?" : "Already have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setSignupStep(1); // Reset step when switching
                  setError('');
                }}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-[#5dbd62] text-gray-800 text-sm font-medium hover:bg-[#51a956]"
              >
                {isLogin ? 'Create an account' : 'Sign in instead'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Auth;