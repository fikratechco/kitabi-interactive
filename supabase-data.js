/* global window */

// ============================================
// DATA SERVICE — CRUD OPERATIONS
// ============================================

class DataService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  // ===== CHILDREN =====
  async getChildren(parentId) {
    try {
      const { data, error } = await this.supabase
        .from('children')
        .select('*')
        .eq('parent_id', parentId);
      return error ? null : data;
    } catch (error) {
      console.error('Error fetching children:', error);
      return null;
    }
  }

  async createChild(parentId, name, age, avatar = '👦') {
    try {
      const { data, error } = await this.supabase
        .from('children')
        .insert([{ parent_id: parentId, name, age, avatar }])
        .select();
      
      if (error) throw error;

      if (data && data[0]) {
        // Initialize progress
        await this.supabase
          .from('child_progress')
          .insert([{ child_id: data[0].id }]);
      }
      return data;
    } catch (error) {
      console.error('Error creating child:', error);
      return null;
    }
  }

  // ===== PROGRESS =====
  async getProgress(childId) {
    try {
      const { data, error } = await this.supabase
        .from('child_progress')
        .select('*')
        .eq('child_id', childId)
        .single();
      return error ? null : data;
    } catch (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
  }

  async updateProgress(childId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('child_progress')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('child_id', childId)
        .select();
      return error ? null : data;
    } catch (error) {
      console.error('Error updating progress:', error);
      return null;
    }
  }

  async addStar(childId) {
    try {
      const progress = await this.getProgress(childId);
      if (!progress) return null;
      return this.updateProgress(childId, {
        stars: (progress.stars || 0) + 1,
      });
    } catch (error) {
      console.error('Error adding star:', error);
      return null;
    }
  }

  async recordTextRead(childId, bookId, textId, status) {
    try {
      const progress = await this.getProgress(childId);
      if (!progress) return null;

      const textsRead = JSON.parse(progress.texts_read || '{}');
      if (!textsRead[bookId]) textsRead[bookId] = {};
      textsRead[bookId][textId] = status;

      return this.updateProgress(childId, {
        texts_read: JSON.stringify(textsRead),
      });
    } catch (error) {
      console.error('Error recording text:', error);
      return null;
    }
  }

  async incrementMinutesSpent(childId, minutes = 1) {
    try {
      const progress = await this.getProgress(childId);
      if (!progress) return null;
      return this.updateProgress(childId, {
        minutes_spent: (progress.minutes_spent || 0) + minutes,
        last_active: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error incrementing minutes:', error);
      return null;
    }
  }

  // ===== DIAGNOSTIC =====
  async saveDiagnostic(childId, score, interpretation, resultsJson) {
    try {
      const { data, error } = await this.supabase
        .from('diagnostic_results')
        .insert([{
          child_id: childId,
          score,
          interpretation,
          results_json: JSON.stringify(resultsJson),
        }])
        .select();
      return error ? null : data;
    } catch (error) {
      console.error('Error saving diagnostic:', error);
      return null;
    }
  }

  async getDiagnosticHistory(childId) {
    try {
      const { data, error } = await this.supabase
        .from('diagnostic_results')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });
      return error ? [] : data;
    } catch (error) {
      console.error('Error fetching diagnostic history:', error);
      return [];
    }
  }

  // ===== SETTINGS =====
  async getSettings(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      return error ? null : data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  }

  async updateSettings(userId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('user_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select();
      return error ? null : data;
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  }
}

// Export
window.DataService = DataService;
