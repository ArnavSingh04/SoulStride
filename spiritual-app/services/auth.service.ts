import { supabase } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Sign up with email and password
export async function signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name || '',
        },
      },
    });

    if (error) {
      return { user: null, error };
    }

    return { user: authData.user, error: null };
  } catch (error) {
    return { 
      user: null, 
      error: error as AuthError 
    };
  }
}

// Sign in with email and password
export async function signIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { user: null, error };
    }

    return { user: authData.user, error: null };
  } catch (error) {
    return { 
      user: null, 
      error: error as AuthError 
    };
  }
}

// Sign out
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error: error as AuthError };
  }
}

// Get current session
export async function getSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(updates: {
  name?: string;
  avatar_url?: string;
}): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      data: updates,
    });
    return { error };
  } catch (error) {
    return { error: error as AuthError };
  }
}

export interface OnboardingData {
  name: string;
  dailyMinutes: number;
  comfortLanguage: string;
  selectedHolyBookIds: string[];
}

// Save onboarding answers to user metadata (when signed in) for sync across devices
export async function saveOnboardingToUser(data: OnboardingData): Promise<{ error: AuthError | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: null };
    const { error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        name: data.name,
        onboarding: {
          name: data.name,
          dailyMinutes: data.dailyMinutes,
          comfortLanguage: data.comfortLanguage,
          selectedHolyBookIds: data.selectedHolyBookIds,
        },
      },
    });
    return { error };
  } catch (error) {
    return { error: error as AuthError };
  }
}

// Reset password
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'soulstride://reset-password',
    });
    return { error };
  } catch (error) {
    return { error: error as AuthError };
  }
}

// Convert Supabase User to AuthUser
export function userToAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || undefined,
    avatar_url: user.user_metadata?.avatar_url || undefined,
  };
}
