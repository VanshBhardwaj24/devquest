import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Task } from '../types';

export const taskService = {
  async getTasks(userId: string) {
    // Return empty array if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.log('Demo mode: Returning empty tasks');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      return (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        priority: task.priority as 'Elite' | 'Core' | 'Bonus',
        completed: task.completed,
        xp: task.xp,
        category: task.category,
        dueDate: new Date(task.due_date || Date.now()),
        createdAt: new Date(task.created_at),
        streak: task.streak,
      }));
    } catch (error) {
      console.error('Error in getTasks:', error);
      return [];
    }
  },

  async createTask(userId: string, task: Omit<Task, 'id'>) {
    // Skip if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.log('Demo mode: Simulating task creation');
      return { id: `demo-task-${Date.now()}`, ...task };
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title: task.title,
          description: task.description,
          priority: task.priority,
          completed: task.completed,
          xp: task.xp,
          category: task.category,
          due_date: task.dueDate.toISOString(),
          streak: task.streak,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async updateTask(userId: string, taskId: string, updates: Partial<Task>) {
    // Skip if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.log('Demo mode: Simulating task update');
      return { id: taskId, ...updates };
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          priority: updates.priority,
          completed: updates.completed,
          xp: updates.xp,
          category: updates.category,
          due_date: updates.dueDate?.toISOString(),
          streak: updates.streak,
        })
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(userId: string, taskId: string) {
    // Skip if Supabase is not configured
    if (!isSupabaseConfigured()) {
      console.log('Demo mode: Simulating task deletion');
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
};