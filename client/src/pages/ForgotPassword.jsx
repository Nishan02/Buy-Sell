import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Separate errors for frontend validation vs backend API issues
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setApiError('');

    // 1. Frontend Validation
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    // 2. Backend Call
    setIsLoading(true);
    try {
      // Connect to your actual Backend API
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setIsSuccess(true);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to send email. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
    setEmail('');
    setApiError('');
    setValidationError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-8 font-sans">
      <div className="w-full max-w-md">
        
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group">
            <h1 className="text-3xl font-bold text-indigo-600 bg-clip-text hover:from-orange-700 hover:to-amber-700 transition-all duration-300">
               Campus<span className="text-gray-800">Mart</span>
            </h1>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl border border-white p-8 hover:shadow-3xl transition-shadow duration-300">
          
          {/* Header */}
          <div className="space-y-3 pb-6">
            <div className="mx-auto w-14 h-14 bg-[#e1e1e2] rounded-full flex items-center justify-center mb-2">
              <Mail className="w-7 h-7 " />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900">
              {isSuccess ? 'Check Your Email' : 'Forgot Password?'}
            </h2>
            <p className="text-center text-gray-600 text-base">
              {isSuccess
                ? `We've sent a password reset link to ${email}`
                : "No worries! Enter your email and we'll send you reset instructions."}
            </p>
          </div>

          <div className="space-y-6">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* API Error Alert */}
                {apiError && (
                   <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                     <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                     <p className="text-sm text-red-700">{apiError}</p>
                   </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="you@mnnit.ac.in"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setValidationError('');
                      }}
                      disabled={isLoading}
                      className={`w-full pl-10 pr-4 h-12 rounded-lg border bg-white text-base transition-all duration-200 outline-none
                        ${validationError || apiError
                          ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                          : 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                        }`}
                    />
                  </div>
                  {validationError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      {validationError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-lg text-base font-semibold bg-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-900">
                      Password reset link sent
                    </p>
                    <p className="text-sm text-green-700">
                      If you don't see the email, check your spam folder.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleTryAgain}
                  className="w-full h-12 rounded-lg text-base font-semibold border-2 border-gray-200 hover:bg-orange-50 hover:border-orange-300 text-gray-700 transition-all duration-300"
                >
                  Try Another Email
                </button>
              </div>
            )}

            {/* Back to Login Link */}
            <div className="pt-4 border-t border-gray-100">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors duration-200 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Need more help?{' '}
          <a 
            href="mailto:riteshsingh0977@gmail.com" 
            className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword; 