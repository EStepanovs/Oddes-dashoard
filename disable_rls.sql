-- Disable Row Level Security on your data table
-- Run this SQL command in your Supabase SQL Editor

ALTER TABLE data_by_roberts DISABLE ROW LEVEL SECURITY;

-- This allows authenticated users to access all data in the table
-- If you want to keep RLS but allow access, use Option 2 instead