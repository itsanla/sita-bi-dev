'use client';

import { useState, FormEvent, ChangeEvent, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Book,
  Users,
  Hash,
  Phone,
} from 'lucide-react';

// --- InputField Component (Refactored) ---
interface InputFieldProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon: ComponentType<{ className?: string }>;
  isPassword?: boolean;
  showPasswordState?: boolean;
  toggleShowPassword?: () => void;
}

const InputField = ({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
  icon: Icon,
  isPassword = false,
  showPasswordState,
  toggleShowPassword,
}: InputFieldProps) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-rose-600 transition-colors" />
    </div>
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-600 focus:ring-4 focus:ring-rose-100 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
      placeholder={placeholder}
      required
    />
    {isPassword && (
      <button
        type="button"
        onClick={toggleShowPassword}
        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
      >
        {showPasswordState ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    )}
  </div>
);

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    prodi: 'D3',
    phone_number: '',
    kelas: '3A',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const { name, email, nim, prodi, phone_number, kelas, password } = formData;
    const payload = { name, email, nim, prodi, phone_number, kelas, password };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      alert(data.message);
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-rose-600 via-red-700 to-amber-600 p-8 text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Create Account
              </h1>
              <p className="text-white/90 text-sm">Join SITA-BI today!</p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                id="name"
                name="name"
                type="text"
                placeholder="Full Name"
                value={formData.name}
                icon={User}
                onChange={handleChange}
              />
              <InputField
                id="email"
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                icon={Mail}
                onChange={handleChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="nim"
                  name="nim"
                  type="text"
                  placeholder="NIM"
                  value={formData.nim}
                  icon={Hash}
                  onChange={handleChange}
                />
                <InputField
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  placeholder="No. HP (08...)"
                  value={formData.phone_number}
                  icon={Phone}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Book className="h-5 w-5 text-gray-400 group-focus-within:text-rose-600 transition-colors" />
                    </div>
                    <select
                      name="prodi"
                      value={formData.prodi}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-600 focus:ring-4 focus:ring-rose-100 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                    >
                      <option value="D3">D3</option>
                      <option value="D4">D4</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400 group-focus-within:text-rose-600 transition-colors" />
                    </div>
                    <select
                      name="kelas"
                      value={formData.kelas}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-600 focus:ring-4 focus:ring-rose-100 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                    >
                      <option value="3A">3A</option>
                      <option value="3B">3B</option>
                      <option value="3C">3C</option>
                      <option value="4A">4A</option>
                      <option value="4B">4B</option>
                    </select>
                  </div>
                </div>
              </div>
              <InputField
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                icon={Lock}
                isPassword={true}
                showPasswordState={showPassword}
                toggleShowPassword={() => setShowPassword(!showPassword)}
                onChange={handleChange}
              />
              <InputField
                id="password_confirmation"
                name="password_confirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.password_confirmation}
                icon={Lock}
                isPassword={true}
                showPasswordState={showConfirmPassword}
                toggleShowPassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                onChange={handleChange}
              />

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <UserPlus className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl border-2 border-rose-600 text-rose-600 font-semibold hover:bg-rose-50 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign In Instead
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  );
}
