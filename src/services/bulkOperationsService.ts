// Bulk Operations Service
// Handles bulk updates, assignments, and exports

import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BulkOperation {
  id: string;
  type: 'status_update' | 'assignment' | 'export' | 'delete' | 'archive';
  targetType: 'tasks' | 'claims' | 'authorizations' | 'patients';
  itemIds: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results?: BulkOperationResults;
  created_at: string;
  completed_at?: string;
}

export interface BulkOperationResults {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export class BulkOperationsService {
  private static instance: BulkOperationsService;

  static getInstance(): BulkOperationsService {
    if (!BulkOperationsService.instance) {
      BulkOperationsService.instance = new BulkOperationsService();
    }
    return BulkOperationsService.instance;
  }

  // Bulk status update
  async bulkUpdateStatus(
    targetType: 'tasks' | 'claims' | 'authorizations',
    itemIds: string[],
    newStatus: string,
    userId: string
  ): Promise<BulkOperationResults> {
    const results: BulkOperationResults = {
      total: itemIds.length,
      successful: 0,
      failed: 0,
      errors: [],
    };

    try {
      let tableName: string;
      let statusField: string;

      switch (targetType) {
        case 'tasks':
          tableName = 'authorization_tasks';
          statusField = 'status';
          break;
        case 'claims':
          tableName = 'claims';
          statusField = 'status';
          break;
        case 'authorizations':
          tableName = 'authorization_requests';
          statusField = 'status';
          break;
        default:
          throw new Error('Invalid target type');
      }

      // Update all items
      const { data, error } = await supabase
        .from(tableName as any)
        .update({
          [statusField]: newStatus,
          updated_at: new Date().toISOString(),
        })
        .in('id', itemIds)
        .select('id');

      if (error) throw error;

      results.successful = data?.length || 0;
      results.failed = results.total - results.successful;

      // Log errors for failed items
      if (results.failed > 0) {
        const successfulIds = new Set(data?.map((item: any) => item.id) || []);
        itemIds.forEach(id => {
          if (!successfulIds.has(id)) {
            results.errors.push({
              id,
              error: 'Update failed',
            });
          }
        });
      }
    } catch (error: any) {
      results.failed = results.total;
      results.errors = itemIds.map(id => ({
        id,
        error: error.message || 'Bulk update failed',
      }));
    }

    return results;
  }

  // Bulk assignment
  async bulkAssign(
    targetType: 'tasks' | 'claims' | 'authorizations',
    itemIds: string[],
    assignedTo: string,
    assignedBy: string
  ): Promise<BulkOperationResults> {
    const results: BulkOperationResults = {
      total: itemIds.length,
      successful: 0,
      failed: 0,
      errors: [],
    };

    try {
      let tableName: string;

      switch (targetType) {
        case 'tasks':
          tableName = 'authorization_tasks';
          break;
        case 'claims':
          tableName = 'claims';
          break;
        case 'authorizations':
          tableName = 'authorization_requests';
          break;
        default:
          throw new Error('Invalid target type');
      }

      const { data, error } = await supabase
        .from(tableName as any)
        .update({
          assigned_to: assignedTo,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', itemIds)
        .select('id');

      if (error) throw error;

      results.successful = data?.length || 0;
      results.failed = results.total - results.successful;
    } catch (error: any) {
      results.failed = results.total;
      results.errors = itemIds.map(id => ({
        id,
        error: error.message || 'Bulk assignment failed',
      }));
    }

    return results;
  }

  // Bulk export
  async bulkExport(
    targetType: 'tasks' | 'claims' | 'authorizations',
    itemIds: string[],
    format: 'csv' | 'excel' | 'json' | 'pdf'
  ): Promise<{ data: any; filename: string }> {
    try {
      let tableName: string;

      switch (targetType) {
        case 'tasks':
          tableName = 'authorization_tasks';
          break;
        case 'claims':
          tableName = 'claims';
          break;
        case 'authorizations':
          tableName = 'authorization_requests';
          break;
        default:
          throw new Error('Invalid target type');
      }

      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .in('id', itemIds);

      if (error) throw error;

      const filename = `${targetType}_export_${new Date().toISOString().split('T')[0]}.${format}`;

      let exportData: string;

      switch (format) {
        case 'csv':
          exportData = this.convertToCSV(data || []);
          break;
        case 'json':
          exportData = JSON.stringify(data, null, 2);
          break;
        case 'excel':
          // Would use a library like xlsx in production
          exportData = this.convertToCSV(data || []);
          break;
        case 'pdf':
          // Would use a PDF library in production
          throw new Error('PDF export not yet implemented');
        default:
          throw new Error('Invalid export format');
      }

      return { data: exportData, filename };
    } catch (error: any) {
      throw new Error(error.message || 'Export failed');
    }
  }

  // Bulk delete
  async bulkDelete(
    targetType: 'tasks' | 'claims' | 'authorizations',
    itemIds: string[],
    userId: string
  ): Promise<BulkOperationResults> {
    const results: BulkOperationResults = {
      total: itemIds.length,
      successful: 0,
      failed: 0,
      errors: [],
    };

    try {
      let tableName: string;

      switch (targetType) {
        case 'tasks':
          tableName = 'authorization_tasks';
          break;
        case 'claims':
          tableName = 'claims';
          break;
        case 'authorizations':
          tableName = 'authorization_requests';
          break;
        default:
          throw new Error('Invalid target type');
      }

      const { data, error } = await supabase
        .from(tableName as any)
        .delete()
        .in('id', itemIds)
        .select('id');

      if (error) throw error;

      results.successful = data?.length || 0;
      results.failed = results.total - results.successful;
    } catch (error: any) {
      results.failed = results.total;
      results.errors = itemIds.map(id => ({
        id,
        error: error.message || 'Bulk delete failed',
      }));
    }

    return results;
  }

  // Convert data to CSV
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  // Download file
  downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const bulkOperationsService = BulkOperationsService.getInstance();

