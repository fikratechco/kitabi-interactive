/* global window */

// ============================================
// AUTHENTICATION SERVICE
// ============================================

const AUTH_ERRORS_AR = {
  'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'Email not confirmed': 'يرجى تأكيد بريدك الإلكتروني أولاً.',
  'User already registered': 'هذا البريد الإلكتروني مسجَّل بالفعل.',
  'Password should be at least 6 characters': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
  'Unable to validate email address: invalid format': 'صيغة البريد الإلكتروني غير صحيحة.',
  'signup is disabled': 'التسجيل متوقف مؤقتاً. حاول لاحقاً.',
  'Email rate limit exceeded': 'طلبات كثيرة جداً. انتظر قليلاً ثم حاول مجدداً.',
  'For security purposes, you can only request this after': 'لأسباب أمنية، انتظر قليلاً قبل المحاولة مجدداً.',
  'network': 'خطأ في الاتصال بالإنترنت. تحقق من اتصالك وحاول مجدداً.',
};

function toArabicError(message) {
  if (!message) return 'حدث خطأ غير متوقع. حاول مجدداً.';
  for (const [en, ar] of Object.entries(AUTH_ERRORS_AR)) {
    if (message.toLowerCase().includes(en.toLowerCase())) return ar;
  }
  if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
    return AUTH_ERRORS_AR['network'];
  }
  return 'حدث خطأ: ' + message;
}

class AuthService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient || window.supabaseClient;
  }

  // Sign up new user
  async signup(email, password, name, role = 'parent') {
    try {
      // Create auth user
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        const { error: profileError } = await this.supabase
          .from('user_profiles')
          .insert([{
            id: data.user.id,
            email,
            name,
            role,
          }]);

        if (profileError) throw profileError;

        // Create settings
        await this.supabase
          .from('user_settings')
          .insert([{ user_id: data.user.id }]);
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: toArabicError(error.message) };
    }
  }

  // Login user
  async login(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: toArabicError(error.message) };
    }
  }

  // Logout
  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      return null;
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  // Send password reset email (Supabase magic link)
  async resetPassword(email) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/?reset=1',
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: toArabicError(error.message) };
    }
  }

  // Restore session
  async restoreSession() {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      return null;
    }
  }
}

// Export
window.AuthService = AuthService;
