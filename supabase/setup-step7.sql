-- STEP 7: Add foreign key constraints
-- Run this after Step 6

ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE families ADD CONSTRAINT families_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE profiles ADD CONSTRAINT profiles_family_id_fkey FOREIGN KEY (family_id) REFERENCES families(id);
ALTER TABLE daily_goals ADD CONSTRAINT daily_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE streaks ADD CONSTRAINT streaks_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE library_content ADD CONSTRAINT library_content_category_id_fkey FOREIGN KEY (category_id) REFERENCES library_categories(id);
ALTER TABLE user_library_progress ADD CONSTRAINT user_library_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE user_library_progress ADD CONSTRAINT user_library_progress_content_id_fkey FOREIGN KEY (content_id) REFERENCES library_content(id) ON DELETE CASCADE;
ALTER TABLE playlists ADD CONSTRAINT playlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE playlist_items ADD CONSTRAINT playlist_items_playlist_id_fkey FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE;
ALTER TABLE playlist_items ADD CONSTRAINT playlist_items_content_id_fkey FOREIGN KEY (content_id) REFERENCES library_content(id) ON DELETE CASCADE;
ALTER TABLE threads ADD CONSTRAINT threads_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE thread_likes ADD CONSTRAINT thread_likes_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE;
ALTER TABLE thread_likes ADD CONSTRAINT thread_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE thread_comments ADD CONSTRAINT thread_comments_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE;
ALTER TABLE thread_comments ADD CONSTRAINT thread_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE thread_reposts ADD CONSTRAINT thread_reposts_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE;
ALTER TABLE thread_reposts ADD CONSTRAINT thread_reposts_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE pomodoro_sessions ADD CONSTRAINT pomodoro_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE habits ADD CONSTRAINT habits_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE habit_tracking ADD CONSTRAINT habit_tracking_habit_id_fkey FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE;
ALTER TABLE habit_tracking ADD CONSTRAINT habit_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE zakat_sadaqah ADD CONSTRAINT zakat_sadaqah_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE reports ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES profiles(id);
ALTER TABLE reports ADD CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES profiles(id);
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);
