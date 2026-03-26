"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  LogOut,
  Settings,
  Edit,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles
} from "lucide-react";
import { authService, type UserResponse } from "@/lib/auth";
import { ApiException } from "@/lib/api";

export function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          router.push("/signin");
          return;
        }

        // Try to get cached user data first
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }

        // Fetch fresh user data from API
        const userData = await authService.getMe();
        setUser(userData);
      } catch (err) {
        console.error("❌ Failed to load user data:", err);

        if (err instanceof ApiException && err.status === 401) {
          // User is not authenticated, redirect to signin
          authService.logout(); // Clear any invalid tokens
          router.push("/signin");
        } else {
          setError("Failed to load profile data. Please try refreshing the page.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError("");

    try {
      await authService.logout();
      router.push("/signin");
    } catch (err) {
      console.error("❌ Logout error:", err);
      // Still redirect even if logout API fails (tokens are cleared locally)
      router.push("/signin");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error || "Unable to load your profile. Please sign in again."}
          </p>
          <button
            onClick={() => router.push("/signin")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="size-4 text-primary" />
              </div>
              <span className="text-lg font-semibold">Money Mentor</span>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="size-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.full_name}
                </h1>
                <p className="text-muted-foreground mb-3">{user.email}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {user.is_verified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600 font-medium">Not Verified</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${user.is_active ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-sm font-medium ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors">
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              {user.phone ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-50">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone Number</p>
                    <p className="text-muted-foreground">Not provided</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Account Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium font-mono text-xs">{user.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Created</p>
                  <p className="font-medium">{formatDate(user.created_at)}</p>
                </div>
              </div>

              {user.last_login_at && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">{formatDate(user.last_login_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold">Account Settings</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Update your password, privacy settings, and notifications
            </p>
          </button>

          <button className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold">Security</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Two-factor authentication and security preferences
            </p>
          </button>

          <button className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-semibold">Personal Info</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Edit your personal information and profile details
            </p>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}