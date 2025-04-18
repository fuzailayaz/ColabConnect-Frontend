'use client';

import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm from '@/components/auth/AuthForm';

export default function RegisterPage() {
  return (
    <AuthLayout mode="register">
      <AuthForm mode="register" />
    </AuthLayout>
  );
}