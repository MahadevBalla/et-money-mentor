"use client";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: Readonly<AuthLayoutProps>) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}