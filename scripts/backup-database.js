#!/usr/bin/env node

/**
 * Database Backup Script for BillWise AI Nexus
 * 
 * This script creates automated backups of the Supabase database
 * and stores them securely for disaster recovery.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  backupDir: process.env.BACKUP_DIR || path.join(__dirname, '../backups'),
  encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
  compressionLevel: parseInt(process.env.BACKUP_COMPRESSION_LEVEL || '6'),
};

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

class DatabaseBackup {
  constructor() {
    this.ensureBackupDirectory();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(config.backupDir)) {
      fs.mkdirSync(config.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `billwise-backup-${timestamp}`;
    const backupPath = path.join(config.backupDir, `${backupName}.json`);

    console.log(`🔄 Starting database backup: ${backupName}`);

    try {
      // Get all tables and their data
      const tables = await this.getAllTables();
      const backupData = {
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          database: 'billwise-ai-nexus',
          tables: tables.length,
        },
        tables: {},
      };

      // Backup each table
      for (const table of tables) {
        console.log(`📊 Backing up table: ${table}`);
        const data = await this.getTableData(table);
        backupData.tables[table] = data;
      }

      // Write backup to file
      const backupContent = JSON.stringify(backupData, null, 2);
      fs.writeFileSync(backupPath, backupContent);

      // Encrypt backup if encryption key is provided
      if (config.encryptionKey) {
        await this.encryptBackup(backupPath);
        fs.unlinkSync(backupPath); // Remove unencrypted file
      }

      // Compress backup
      await this.compressBackup(backupPath + (config.encryptionKey ? '.enc' : ''));

      console.log(`✅ Backup completed: ${backupName}`);
      return backupName;
    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  async getAllTables() {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'audit_logs'); // Exclude audit logs for performance

    if (error) throw error;

    return data.map(row => row.table_name);
  }

  async getTableData(tableName) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) throw error;

    return {
      count: data.length,
      data: data,
    };
  }

  async encryptBackup(filePath) {
    const encryptedPath = filePath + '.enc';
    const content = fs.readFileSync(filePath);
    const cipher = crypto.createCipher('aes-256-cbc', config.encryptionKey);
    const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
    
    fs.writeFileSync(encryptedPath, encrypted);
    console.log(`🔐 Backup encrypted: ${encryptedPath}`);
  }

  async compressBackup(filePath) {
    const { gzip } = await import('zlib');
    const { promisify } = await import('util');
    const gzipAsync = promisify(gzip);

    const content = fs.readFileSync(filePath);
    const compressed = await gzipAsync(content, { level: config.compressionLevel });
    
    const compressedPath = filePath + '.gz';
    fs.writeFileSync(compressedPath, compressed);
    fs.unlinkSync(filePath); // Remove uncompressed file
    
    console.log(`🗜️ Backup compressed: ${compressedPath}`);
  }

  async restoreBackup(backupName) {
    const backupPath = path.join(config.backupDir, `${backupName}.json.gz.enc`);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupName}`);
    }

    console.log(`🔄 Starting database restore: ${backupName}`);

    try {
      // Decrypt and decompress backup
      const backupData = await this.decryptAndDecompressBackup(backupPath);
      
      // Restore each table
      for (const [tableName, tableData] of Object.entries(backupData.tables)) {
        console.log(`📊 Restoring table: ${tableName}`);
        await this.restoreTableData(tableName, tableData.data);
      }

      console.log(`✅ Restore completed: ${backupName}`);
    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  async decryptAndDecompressBackup(filePath) {
    // Decompress
    const { gunzip } = await import('zlib');
    const { promisify } = await import('util');
    const gunzipAsync = promisify(gunzip);

    const compressed = fs.readFileSync(filePath);
    const decompressed = await gunzipAsync(compressed);

    // Decrypt
    const decipher = crypto.createDecipher('aes-256-cbc', config.encryptionKey);
    const decrypted = Buffer.concat([decipher.update(decompressed), decipher.final()]);

    return JSON.parse(decrypted.toString());
  }

  async restoreTableData(tableName, data) {
    // Clear existing data
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) throw deleteError;

    // Insert new data in batches
    const batchSize = 1000;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const { error } = await supabase
        .from(tableName)
        .insert(batch);

      if (error) throw error;
    }
  }

  async listBackups() {
    const files = fs.readdirSync(config.backupDir);
    const backups = files
      .filter(file => file.startsWith('billwise-backup-') && file.endsWith('.json.gz.enc'))
      .map(file => {
        const stats = fs.statSync(path.join(config.backupDir, file));
        return {
          name: file.replace('.json.gz.enc', ''),
          size: stats.size,
          created: stats.birthtime,
        };
      })
      .sort((a, b) => b.created - a.created);

    return backups;
  }

  async cleanupOldBackups() {
    const backups = await this.listBackups();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);

    const oldBackups = backups.filter(backup => backup.created < cutoffDate);
    
    for (const backup of oldBackups) {
      const filePath = path.join(config.backupDir, `${backup.name}.json.gz.enc`);
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted old backup: ${backup.name}`);
    }

    console.log(`🧹 Cleanup completed: ${oldBackups.length} old backups removed`);
  }

  async verifyBackup(backupName) {
    const backupPath = path.join(config.backupDir, `${backupName}.json.gz.enc`);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupName}`);
    }

    try {
      const backupData = await this.decryptAndDecompressBackup(backupPath);
      
      console.log(`✅ Backup verification successful:`);
      console.log(`   - Tables: ${Object.keys(backupData.tables).length}`);
      console.log(`   - Timestamp: ${backupData.metadata.timestamp}`);
      console.log(`   - Version: ${backupData.metadata.version}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Backup verification failed:`, error);
      return false;
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const backup = new DatabaseBackup();

  switch (command) {
    case 'create':
      await backup.createBackup();
      break;
    case 'list':
      const backups = await backup.listBackups();
      console.log('📋 Available backups:');
      backups.forEach(b => {
        console.log(`   - ${b.name} (${(b.size / 1024 / 1024).toFixed(2)} MB, ${b.created.toISOString()})`);
      });
      break;
    case 'restore':
      const backupName = process.argv[3];
      if (!backupName) {
        console.error('❌ Please specify backup name');
        process.exit(1);
      }
      await backup.restoreBackup(backupName);
      break;
    case 'verify':
      const verifyName = process.argv[3];
      if (!verifyName) {
        console.error('❌ Please specify backup name');
        process.exit(1);
      }
      await backup.verifyBackup(verifyName);
      break;
    case 'cleanup':
      await backup.cleanupOldBackups();
      break;
    default:
      console.log('Usage: node backup-database.js <command> [options]');
      console.log('Commands:');
      console.log('  create    - Create a new backup');
      console.log('  list      - List available backups');
      console.log('  restore   - Restore from backup');
      console.log('  verify    - Verify backup integrity');
      console.log('  cleanup   - Remove old backups');
      break;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DatabaseBackup };
