#!/usr/bin/env node

/**
 * Migration script to fix Telegram timestamp storage issues
 * 
 * This script:
 * 1. Updates the telegram_messages table schema to use BIGINT for timestamps
 * 2. Adds helper functions for timestamp conversion
 * 3. Provides options to migrate existing data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL and SUPABASE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class TelegramTimestampMigration {
  constructor() {
    this.supabase = supabase;
  }

  /**
   * Check current table schema
   */
  async checkCurrentSchema() {
    try {
      console.log('🔍 Checking current telegram_messages table schema...');
      
      const { data, error } = await this.supabase
        .rpc('get_table_columns', { table_name: 'telegram_messages' });
      
      if (error) {
        // Fallback: try to describe the table structure
        const { data: tableInfo, error: tableError } = await this.supabase
          .from('telegram_messages')
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.log('📋 Table may not exist yet or has no data');
          return null;
        }
        
        console.log('📋 Current table structure detected');
        return 'exists';
      }
      
      console.log('📋 Current schema:', data);
      return data;
    } catch (error) {
      console.error('❌ Error checking schema:', error.message);
      return null;
    }
  }

  /**
   * Update table schema to use BIGINT for timestamps
   */
  async updateTableSchema() {
    try {
      console.log('🔧 Updating telegram_messages table schema...');
      
      const migrationSQL = `
        -- Update telegram_messages table to use BIGINT for timestamps
        ALTER TABLE telegram_messages 
        ALTER COLUMN date TYPE BIGINT USING date::BIGINT;
        
        ALTER TABLE telegram_messages 
        ALTER COLUMN forward_date TYPE BIGINT USING forward_date::BIGINT;
        
        ALTER TABLE telegram_messages 
        ALTER COLUMN edit_date TYPE BIGINT USING edit_date::BIGINT;
        
        -- Add helper functions
        CREATE OR REPLACE FUNCTION unix_to_timestamp(unix_time BIGINT)
        RETURNS TIMESTAMP WITH TIME ZONE AS $$
        BEGIN
            RETURN to_timestamp(unix_time);
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE OR REPLACE FUNCTION get_telegram_message_date(message_id BIGINT, channel_id TEXT)
        RETURNS TIMESTAMP WITH TIME ZONE AS $$
        DECLARE
            unix_date BIGINT;
        BEGIN
            SELECT date INTO unix_date 
            FROM telegram_messages 
            WHERE message_id = $1 AND channel_id = $2;
            
            IF unix_date IS NULL THEN
                RETURN NULL;
            END IF;
            
            RETURN to_timestamp(unix_date);
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const { data, error } = await this.supabase.rpc('exec_sql', { 
        sql: migrationSQL 
      });
      
      if (error) {
        console.error('❌ Error updating schema:', error);
        return false;
      }
      
      console.log('✅ Schema updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating schema:', error.message);
      return false;
    }
  }

  /**
   * Create table with correct schema if it doesn't exist
   */
  async createTableWithCorrectSchema() {
    try {
      console.log('🏗️ Creating telegram_messages table with correct schema...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS telegram_messages (
            id SERIAL PRIMARY KEY,
            channel_id TEXT NOT NULL,
            channel_title TEXT,
            message_id BIGINT NOT NULL,
            text TEXT,
            date BIGINT,
            author_signature TEXT,
            forward_from_chat_id TEXT,
            forward_from_chat_title TEXT,
            forward_from_message_id BIGINT,
            forward_date BIGINT,
            reply_to_message_id BIGINT,
            edit_date BIGINT,
            media_group_id TEXT,
            has_photo BOOLEAN DEFAULT false,
            has_video BOOLEAN DEFAULT false,
            has_document BOOLEAN DEFAULT false,
            has_audio BOOLEAN DEFAULT false,
            has_voice BOOLEAN DEFAULT false,
            has_video_note BOOLEAN DEFAULT false,
            has_sticker BOOLEAN DEFAULT false,
            has_animation BOOLEAN DEFAULT false,
            has_contact BOOLEAN DEFAULT false,
            has_location BOOLEAN DEFAULT false,
            has_venue BOOLEAN DEFAULT false,
            has_poll BOOLEAN DEFAULT false,
            photo_urls TEXT[],
            video_url TEXT,
            document_url TEXT,
            audio_url TEXT,
            voice_url TEXT,
            views INTEGER,
            reactions_count INTEGER,
            entities JSONB,
            caption TEXT,
            scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            raw_data JSONB DEFAULT '{}'::jsonb,
            UNIQUE(channel_id, message_id)
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_telegram_messages_channel_id ON telegram_messages(channel_id);
        CREATE INDEX IF NOT EXISTS idx_telegram_messages_message_id ON telegram_messages(message_id);
        CREATE INDEX IF NOT EXISTS idx_telegram_messages_date ON telegram_messages(date);
        CREATE INDEX IF NOT EXISTS idx_telegram_messages_scraped_at ON telegram_messages(scraped_at);
        CREATE INDEX IF NOT EXISTS idx_telegram_messages_text ON telegram_messages USING GIN(to_tsvector('english', text));
        
        -- Add helper functions
        CREATE OR REPLACE FUNCTION unix_to_timestamp(unix_time BIGINT)
        RETURNS TIMESTAMP WITH TIME ZONE AS $$
        BEGIN
            RETURN to_timestamp(unix_time);
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE OR REPLACE FUNCTION get_telegram_message_date(message_id BIGINT, channel_id TEXT)
        RETURNS TIMESTAMP WITH TIME ZONE AS $$
        DECLARE
            unix_date BIGINT;
        BEGIN
            SELECT date INTO unix_date 
            FROM telegram_messages 
            WHERE message_id = $1 AND channel_id = $2;
            
            IF unix_date IS NULL THEN
                RETURN NULL;
            END IF;
            
            RETURN to_timestamp(unix_date);
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const { data, error } = await this.supabase.rpc('exec_sql', { 
        sql: createTableSQL 
      });
      
      if (error) {
        console.error('❌ Error creating table:', error);
        return false;
      }
      
      console.log('✅ Table created successfully with correct schema');
      return true;
    } catch (error) {
      console.error('❌ Error creating table:', error.message);
      return false;
    }
  }

  /**
   * Test the migration by inserting a sample message
   */
  async testMigration() {
    try {
      console.log('🧪 Testing migration with sample data...');
      
      const testMessage = {
        channel_id: 'test_channel',
        channel_title: 'Test Channel',
        message_id: 999999,
        text: 'Test message for migration',
        date: Math.floor(Date.now() / 1000), // Current Unix timestamp
        scraped_at: new Date().toISOString()
      };
      
      const { data, error } = await this.supabase
        .from('telegram_messages')
        .insert(testMessage);
      
      if (error) {
        console.error('❌ Test insert failed:', error);
        return false;
      }
      
      console.log('✅ Test insert successful');
      
      // Clean up test data
      await this.supabase
        .from('telegram_messages')
        .delete()
        .eq('channel_id', 'test_channel')
        .eq('message_id', 999999);
      
      console.log('✅ Test data cleaned up');
      return true;
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      return false;
    }
  }

  /**
   * Run the complete migration
   */
  async runMigration() {
    try {
      console.log('🚀 Starting Telegram timestamp migration...');
      
      // Check current schema
      const currentSchema = await this.checkCurrentSchema();
      
      if (currentSchema === null) {
        // Table doesn't exist, create it
        console.log('📋 Table does not exist, creating with correct schema...');
        const created = await this.createTableWithCorrectSchema();
        if (!created) {
          console.error('❌ Failed to create table');
          return false;
        }
      } else {
        // Table exists, update schema
        console.log('📋 Table exists, updating schema...');
        const updated = await this.updateTableSchema();
        if (!updated) {
          console.error('❌ Failed to update schema');
          return false;
        }
      }
      
      // Test the migration
      const testPassed = await this.testMigration();
      if (!testPassed) {
        console.error('❌ Migration test failed');
        return false;
      }
      
      console.log('🎉 Migration completed successfully!');
      console.log('📊 Telegram messages can now store Unix timestamps properly');
      
      return true;
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      return false;
    }
  }
}

// Main execution
async function main() {
  const migration = new TelegramTimestampMigration();
  
  console.log('🔧 Telegram Timestamp Migration Tool');
  console.log('=====================================');
  
  const success = await migration.runMigration();
  
  if (success) {
    console.log('\n✅ Migration completed successfully!');
    console.log('🚀 You can now run your Telegram scrapers without timestamp errors');
  } else {
    console.log('\n❌ Migration failed');
    console.log('🔍 Please check the error messages above and try again');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default TelegramTimestampMigration;
