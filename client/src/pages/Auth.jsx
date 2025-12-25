import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";


const Auth = () => {
  const navigate = useNavigate();

  // STATE: Toggle between Login and Signup
  const [isLogin, setIsLogin] = useState(true);

  // STATE: Track which step of Signup we are on (1 = Details, 2 = OTP)
  const [signupStep, setSignupStep] = useState(1);

  const [showPassword, setShowPassword] = useState(false);

  const [agree, setAgree] = useState(false);


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

  // LOGIC: Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // --- LOGIN FLOW ---
    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // TODO: Call your Backend Login API here
      console.log('Logging in with:', formData.email, formData.password);

      // Simulate API delay
      setTimeout(() => {
        setLoading(false);
        navigate('/'); // Redirect to home on success
      }, 1500);
    }

    // --- SIGNUP FLOW (Step 1: Get Details) ---
    else if (signupStep === 1) {
      // 1. Validation
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

      // TODO: Call Backend to send OTP to email
      console.log('Sending OTP to:', formData.email);

      // Simulate API delay
      setTimeout(() => {
        setLoading(false);
        setSignupStep(2); // Move to OTP step
      }, 1500);
    }

    // --- SIGNUP FLOW (Step 2: Verify OTP) ---
    else if (signupStep === 2) {
      if (formData.otp.length !== 6) {
        setError('Please enter a valid 6-digit code.');
        setLoading(false);
        return;
      }

      // TODO: Call Backend to Verify OTP and Create Account
      console.log('Verifying OTP:', formData.otp);

      // Simulate API delay
      setTimeout(() => {
        setLoading(false);
        alert('Account created successfully!');
        navigate('/'); // Redirect to home
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo or Title */}
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access the secure campus buy&sell goods
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Show error if exists */}
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
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
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
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
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
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm 
                 placeholder-gray-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
                />

                {/* Eye Icon */}
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
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm"
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
                    className="text-center text-2xl tracking-widest appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand focus:border-brand"
                  />
                </div>
              </div>
            )}

            {!isLogin && signupStep == 1 && (
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
                  <Link
                    to="/terms"
                    className="text-green-600 hover:underline font-medium"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-green-600 hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
            )}

            {/* --- SUBMIT BUTTON --- */}
            <div>
              <button
                type="submit"
                disabled={loading || (!isLogin && !agree)}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
      ${loading || (!isLogin && !agree)
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                  }
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
    `}
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
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-[#5dbd62] text-black text-sm font-medium text-gray-500 hover:bg-[#51a956] "
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