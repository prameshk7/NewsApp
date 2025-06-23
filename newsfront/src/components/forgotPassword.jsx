import React, { useState } from 'react';
import api from '../utils/axiosConfig';

function ForgotPassword({ isOpen, onClose, navigate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!form.email) {
      setError('Email is required.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('forgot-password/', { email: form.email });
      setMessage(response.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!form.otp) {
      setError('OTP is required.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('verify-otp/', { email: form.email, code: form.otp });
      setMessage(response.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!form.password || !form.confirmPassword) {
      setError('Both password fields are required.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('reset-password/', { email: form.email, password: form.password });
      setMessage(response.data.message);
      setTimeout(() => {
        onClose();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '32px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1F2937',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}
        </h2>
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{
            backgroundColor: '#D1FAE5',
            color: '#065F46',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            {message}
          </div>
        )}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
              }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{
                  width: '93%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '14px',
                backgroundColor: '#1F2A44',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
              }}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '14px',
                backgroundColor: '#E5E7EB',
                color: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Cancel
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
              }}>OTP</label>
              <input
                type="text"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                style={{
                  width: '93%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
                required
                disabled={loading}
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '14px',
                backgroundColor: '#1F2A44',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
              }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '14px',
                backgroundColor: '#E5E7EB',
                color: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Cancel
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
              }}>New Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{
                  width: '93%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
              }}>Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                style={{
                  width: '93%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '14px',
                backgroundColor: '#1F2A44',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
              }}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '14px',
                backgroundColor: '#E5E7EB',
                color: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;