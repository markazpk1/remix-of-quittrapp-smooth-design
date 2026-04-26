-- STEP 9: Add RLS Policies
-- Run this after Step 8

-- RLS Policies for Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for Daily Goals
CREATE POLICY "Users can view own goals" ON daily_goals FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own goals" ON daily_goals FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own goals" ON daily_goals FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Streaks
CREATE POLICY "Users can view own streaks" ON streaks FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own streaks" ON streaks FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own streaks" ON streaks FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Library Content (Public read, admin write)
CREATE POLICY "Public can view library content" ON library_content FOR SELECT USING (true);
CREATE POLICY "Admins can insert library content" ON library_content FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND verified = true));

-- RLS Policies for User Library Progress
CREATE POLICY "Users can view own progress" ON user_library_progress FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own progress" ON user_library_progress FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own progress" ON user_library_progress FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Playlists
CREATE POLICY "Users can view own playlists" ON playlists FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own playlists" ON playlists FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own playlists" ON playlists FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Threads (Public read, user write own)
CREATE POLICY "Public can view threads" ON threads FOR SELECT USING (true);
CREATE POLICY "Users can insert own threads" ON threads FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own threads" ON threads FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Thread Interactions
CREATE POLICY "Users can view thread likes" ON thread_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON thread_likes FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own likes" ON thread_likes FOR DELETE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Public can view comments" ON thread_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON thread_comments FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view own reposts" ON thread_reposts FOR SELECT USING (true);
CREATE POLICY "Users can insert own reposts" ON thread_reposts FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Productivity Tools
CREATE POLICY "Users can view own pomodoro" ON pomodoro_sessions FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own pomodoro" ON pomodoro_sessions FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view own habit tracking" ON habit_tracking FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own habit tracking" ON habit_tracking FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own habit tracking" ON habit_tracking FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Zakat/Sadaqah
CREATE POLICY "Users can view own zakat" ON zakat_sadaqah FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own zakat" ON zakat_sadaqah FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Journal
CREATE POLICY "Users can view own journal" ON journal_entries FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can insert own journal" ON journal_entries FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- RLS Policies for Reports
CREATE POLICY "Users can insert reports" ON reports FOR INSERT WITH CHECK (reporter_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can view all reports" ON reports FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND verified = true));

-- RLS Policies for Audit Logs
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can view all audit logs" ON audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND verified = true));
