/* global window */

// ============================================
// AUTHENTICATION SERVICE
// ============================================

class AuthService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
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
      return { user: null, error: error.message };
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
      return { user: null, error: error.message };
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
