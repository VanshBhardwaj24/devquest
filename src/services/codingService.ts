import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  platform: 'LeetCode' | 'GeeksforGeeks' | 'CodeChef';
  url: string;
  tags: string[];
  xp: number;
  description?: string;
  solved?: boolean;
  timeSpent?: number;
  solvedAt?: Date;
}

export interface ProblemSubmission {
  id: string;
  userId: string;
  problemId: string;
  solved: boolean;
  timeSpent?: number;
  solutionCode?: string;
  language?: string;
  submittedAt: Date;
}

export interface CodingStreak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastSolvedDate?: Date;
  totalProblemsSolved: number;
}

export const codingService = {
  async getProblems() {
    try {
      const { data, error } = await supabase
        .from('coding_problems')
        .select('*')
        .order('difficulty', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching problems:', error);
      return [];
    }
  },

  async getUserSubmissions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('problem_submissions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },

  async getProblemsWithSubmissions(userId: string): Promise<CodingProblem[]> {
    try {
      const [problems, submissions] = await Promise.all([
        this.getProblems(),
        this.getUserSubmissions(userId)
      ]);

      const submissionMap = new Map(
        submissions.map(sub => [sub.problem_id, sub])
      );

      return problems.map(problem => ({
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty as 'Easy' | 'Medium' | 'Hard',
        platform: problem.platform as 'LeetCode' | 'GeeksforGeeks' | 'CodeChef',
        url: problem.url,
        tags: problem.tags || [],
        xp: problem.xp,
        description: problem.description,
        solved: submissionMap.has(problem.id) && submissionMap.get(problem.id)?.solved,
        timeSpent: submissionMap.get(problem.id)?.time_spent,
        solvedAt: submissionMap.get(problem.id)?.submitted_at 
          ? new Date(submissionMap.get(problem.id)!.submitted_at)
          : undefined,
      }));
    } catch (error) {
      console.error('Error fetching problems with submissions:', error);
      return [];
    }
  },

  async submitSolution(userId: string, problemId: string, data: {
    solved: boolean;
    timeSpent?: number;
    solutionCode?: string;
    language?: string;
  }) {
    try {
      const { data: submission, error } = await supabase
        .from('problem_submissions')
        .upsert({
          user_id: userId,
          problem_id: problemId,
          solved: data.solved,
          time_spent: data.timeSpent,
          solution_code: data.solutionCode,
          language: data.language,
          submitted_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,problem_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Update coding streak if problem was solved
      if (data.solved) {
        await this.updateCodingStreak(userId);
      }

      return submission;
    } catch (error) {
      console.error('Error submitting solution:', error);
      throw error;
    }
  },

  async getCodingStreak(userId: string): Promise<CodingStreak> {
    // Return default streak for demo mode
    if (!isSupabaseConfigured()) {
      console.log('Demo mode: Returning default coding streak');
      return {
        userId,
        currentStreak: 5,
        longestStreak: 12,
        lastSolvedDate: new Date(),
        totalProblemsSolved: 25,
      };
    }

    try {
      const { data, error } = await supabase
        .from('coding_streaks')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const streak = data[0];
        return {
          userId: streak.user_id,
          currentStreak: streak.current_streak,
          longestStreak: streak.longest_streak,
          lastSolvedDate: streak.last_solved_date ? new Date(streak.last_solved_date) : undefined,
          totalProblemsSolved: streak.total_problems_solved,
        };
      }

      // Create initial streak record
      const { data: newStreak, error: createError } = await supabase
        .from('coding_streaks')
        .insert({
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          total_problems_solved: 0,
        })
        .select()
        .single();

      if (createError) throw createError;

      return {
        userId: newStreak.user_id,
        currentStreak: newStreak.current_streak,
        longestStreak: newStreak.longest_streak,
        lastSolvedDate: undefined,
        totalProblemsSolved: newStreak.total_problems_solved,
      };
    } catch (error) {
      console.error('Error fetching coding streak:', error);
      return {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        totalProblemsSolved: 0,
      };
    }
  },

  async updateCodingStreak(userId: string) {
    try {
      const currentStreak = await this.getCodingStreak(userId);
      const today = new Date().toISOString().split('T')[0];
      const lastSolvedDate = currentStreak.lastSolvedDate?.toISOString().split('T')[0];

      let newCurrentStreak = currentStreak.currentStreak;
      
      // If last solved date is yesterday, increment streak
      // If last solved date is today, don't change streak
      // If last solved date is older than yesterday, reset streak to 1
      if (lastSolvedDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastSolvedDate === yesterdayStr) {
          newCurrentStreak += 1;
        } else {
          newCurrentStreak = 1;
        }
      }

      const newLongestStreak = Math.max(currentStreak.longestStreak, newCurrentStreak);

      const { data, error } = await supabase
        .from('coding_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_solved_date: today,
          total_problems_solved: currentStreak.totalProblemsSolved + 1,
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating coding streak:', error);
      throw error;
    }
  },

  async getDailyChallenge() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_challenges')
        .select(`
          *,
          coding_problems (*)
        `)
        .eq('date', today)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
      return null;
    }
  },
};