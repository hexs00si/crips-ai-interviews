import { supabase } from './supabase';

/**
 * Comprehensive user synchronization service
 * Handles all user table operations since triggers are unreliable
 */

export class UserSyncService {
  /**
   * Ensure user exists in public.users table
   */
  static async ensureUser(user) {
    try {
      if (!user?.id) {
        return { success: false, error: 'Invalid user data' };
      }

      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking user existence:', checkError);
      }

      // Prepare user data
      const userData = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'interviewer',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        company: user.user_metadata?.company || null,
        is_active: true,
        email_verified: !!user.email_confirmed_at,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let result;
      
      if (existingUser) {
        // Update existing user
        const { data, error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;
        result = { success: true, action: 'updated', user: data };
      } else {
        // Create new user
        const { data, error } = await supabase
          .from('users')
          .insert(userData)
          .select()
          .single();

        if (error) throw error;
        result = { success: true, action: 'created', user: data };
      }

      console.log(`User sync ${result.action}:`, user.id);
      return result;

    } catch (error) {
      console.error('Error in ensureUser:', error);
      return { 
        success: false, 
        error: error.message,
        details: 'Failed to sync user to database'
      };
    }
  }

  /**
   * Sync user profile updates to both auth and public tables
   */
  static async updateProfile(userId, updates) {
    try {
      // Update auth metadata first
      const { error: authError } = await supabase.auth.updateUser({
        data: updates
      });

      if (authError) throw authError;

      // Update public.users table
      const profileUpdates = {};
      if (updates.first_name !== undefined) profileUpdates.first_name = updates.first_name;
      if (updates.last_name !== undefined) profileUpdates.last_name = updates.last_name;
      if (updates.company !== undefined) profileUpdates.company = updates.company;
      if (updates.role !== undefined) profileUpdates.role = updates.role;

      if (Object.keys(profileUpdates).length > 0) {
        const { error: dbError } = await supabase
          .from('users')
          .update({
            ...profileUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (dbError) {
          console.warn('Failed to update public.users (auth update succeeded):', dbError);
          // Don't throw - auth update was successful
        }
      }

      return { success: true, message: 'Profile updated successfully' };

    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { 
        success: false, 
        error: error.message,
        details: 'Failed to update profile'
      };
    }
  }

  /**
   * Create user during signup (handles both auth and public.users)
   */
  static async createUserOnSignup(userData) {
    try {
      const { email, password, metadata = {} } = userData;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            role: 'interviewer',
            first_name: metadata.first_name?.trim() || '',
            last_name: metadata.last_name?.trim() || '',
            company: metadata.company?.trim() || null,
            ...metadata
          }
        }
      });

      if (authError) throw authError;

      // If user was created, sync to public.users
      if (authData.user) {
        const syncResult = await this.ensureUser(authData.user);
        
        if (!syncResult.success) {
          console.warn('Auth user created but public.users sync failed:', syncResult.error);
          // Still return success since auth user was created
        }
      }

      return {
        success: true,
        user: authData.user,
        session: authData.session,
        requiresConfirmation: !authData.session
      };

    } catch (error) {
      console.error('Error in createUserOnSignup:', error);
      return { 
        success: false, 
        error: error.message,
        details: 'Failed to create user account'
      };
    }
  }

  /**
   * Handle user deletion from both auth and public tables
   */
  static async deleteUser(userId) {
    try {
      // Note: We can't delete from auth.users via frontend
      // This only deletes from public.users and deactivates the account
      
      // First, deactivate in public.users
      const { error: deactivateError } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (deactivateError) throw deactivateError;

      // Sign out the user
      await supabase.auth.signOut();

      return { 
        success: true, 
        message: 'User account deactivated successfully' 
      };

    } catch (error) {
      console.error('Error in deleteUser:', error);
      return { 
        success: false, 
        error: error.message,
        details: 'Failed to delete user account'
      };
    }
  }

  /**
   * Get complete user profile (from public.users with auth fallback)
   */
  static async getUserProfile(userId) {
    try {
      // Try to get from public.users first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!userError) {
        return { success: true, profile: userData };
      }

      // Fallback: get from auth
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;

      const profile = {
        id: authData.user.id,
        email: authData.user.email,
        first_name: authData.user.user_metadata?.first_name || '',
        last_name: authData.user.user_metadata?.last_name || '',
        company: authData.user.user_metadata?.company || null,
        role: authData.user.user_metadata?.role || 'interviewer',
        is_active: true,
        email_verified: !!authData.user.email_confirmed_at,
        created_at: authData.user.created_at,
        updated_at: authData.user.updated_at
      };

      return { success: true, profile };

    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return { 
        success: false, 
        error: error.message,
        details: 'Failed to get user profile'
      };
    }
  }
}

// Convenience functions
export const ensureUserInPublicTable = UserSyncService.ensureUser.bind(UserSyncService);
export const syncUserProfile = UserSyncService.updateProfile.bind(UserSyncService);
export const createUser = UserSyncService.createUserOnSignup.bind(UserSyncService);
export const deleteUser = UserSyncService.deleteUser.bind(UserSyncService);
export const getUserProfile = UserSyncService.getUserProfile.bind(UserSyncService);

export default UserSyncService;