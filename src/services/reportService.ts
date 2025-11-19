// Advanced Reporting Service
// Custom report builder, scheduled reports, PDF/Excel export

import { supabase } from '@/integrations/supabase/client';
import { bulkOperationsService } from './bulkOperationsService';

export interface ReportDefinition {
  id?: string;
  name: string;
  description?: string;
  type: 'authorization' | 'claim' | 'revenue' | 'task' | 'payer' | 'custom';
  dataSource: string; // Table name
  fields: ReportField[];
  filters: ReportFilter[];
  grouping?: ReportGrouping[];
  sorting?: ReportSorting[];
  format: 'table' | 'chart' | 'summary';
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  schedule?: ReportSchedule;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReportField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  format?: string;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
}

export interface ReportGrouping {
  field: string;
  order: 'asc' | 'desc';
}

export interface ReportSorting {
  field: string;
  order: 'asc' | 'desc';
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time?: string; // HH:MM format
  recipients?: string[]; // Email addresses
  format: 'pdf' | 'excel' | 'csv';
}

export interface ReportResult {
  data: any[];
  summary?: {
    total: number;
    aggregates?: Record<string, number>;
  };
  metadata: {
    generatedAt: string;
    recordCount: number;
    executionTime: number;
  };
}

export class ReportService {
  private static instance: ReportService;

  static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  // Generate report from definition
  async generateReport(definition: ReportDefinition): Promise<ReportResult> {
    const startTime = Date.now();

    try {
      let query = supabase.from(definition.dataSource as any).select('*');

      // Apply filters
      query = this.applyFilters(query, definition.filters);

      // Execute query
      const { data, error } = await query;

      if (error) throw error;

      // Process data
      let processedData = data || [];

      // Apply grouping
      if (definition.grouping && definition.grouping.length > 0) {
        processedData = this.applyGrouping(processedData, definition.grouping, definition.fields);
      }

      // Apply sorting
      if (definition.sorting && definition.sorting.length > 0) {
        processedData = this.applySorting(processedData, definition.sorting);
      }

      // Select fields
      processedData = this.selectFields(processedData, definition.fields);

      // Calculate aggregates
      const aggregates = this.calculateAggregates(processedData, definition.fields);

      const executionTime = Date.now() - startTime;

      return {
        data: processedData,
        summary: {
          total: processedData.length,
          aggregates,
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          recordCount: processedData.length,
          executionTime,
        },
      };
    } catch (error: any) {
      console.error('Error generating report:', error);
      throw new Error(error.message || 'Failed to generate report');
    }
  }

  // Apply filters to query
  private applyFilters(query: any, filters: ReportFilter[]): any {
    for (const filter of filters) {
      switch (filter.operator) {
        case 'equals':
          query = query.eq(filter.field, filter.value);
          break;
        case 'not_equals':
          query = query.neq(filter.field, filter.value);
          break;
        case 'contains':
          query = query.ilike(filter.field, `%${filter.value}%`);
          break;
        case 'greater_than':
          query = query.gt(filter.field, filter.value);
          break;
        case 'less_than':
          query = query.lt(filter.field, filter.value);
          break;
        case 'between':
          if (Array.isArray(filter.value) && filter.value.length === 2) {
            query = query.gte(filter.field, filter.value[0]).lte(filter.field, filter.value[1]);
          }
          break;
        case 'in':
          if (Array.isArray(filter.value)) {
            query = query.in(filter.field, filter.value);
          }
          break;
      }
    }
    return query;
  }

  // Apply grouping
  private applyGrouping(data: any[], grouping: ReportGrouping[], fields: ReportField[]): any[] {
    const grouped = new Map<string, any[]>();

    for (const item of data) {
      const key = grouping.map(g => item[g.field]).join('|');
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    }

    const result: any[] = [];
    for (const [key, items] of grouped.entries()) {
      const groupKey = key.split('|');
      const groupItem: any = {};

      grouping.forEach((g, index) => {
        groupItem[g.field] = groupKey[index];
      });

      // Calculate aggregates for grouped items
      fields.forEach(field => {
        if (field.aggregate) {
          groupItem[field.name] = this.calculateAggregate(items, field.name, field.aggregate);
        }
      });

      result.push(groupItem);
    }

    return result;
  }

  // Apply sorting
  private applySorting(data: any[], sorting: ReportSorting[]): any[] {
    return [...data].sort((a, b) => {
      for (const sort of sorting) {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        
        if (aVal < bVal) return sort.order === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Select fields
  private selectFields(data: any[], fields: ReportField[]): any[] {
    return data.map(item => {
      const selected: any = {};
      fields.forEach(field => {
        selected[field.label] = item[field.name];
      });
      return selected;
    });
  }

  // Calculate aggregates
  private calculateAggregates(data: any[], fields: ReportField[]): Record<string, number> {
    const aggregates: Record<string, number> = {};

    fields.forEach(field => {
      if (field.aggregate) {
        aggregates[field.name] = this.calculateAggregate(data, field.name, field.aggregate);
      }
    });

    return aggregates;
  }

  // Calculate aggregate for a field
  private calculateAggregate(data: any[], fieldName: string, aggregate: string): number {
    const values = data.map(item => Number(item[fieldName])).filter(v => !isNaN(v));

    switch (aggregate) {
      case 'sum':
        return values.reduce((sum, val) => sum + val, 0);
      case 'avg':
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
      case 'count':
        return values.length;
      case 'min':
        return values.length > 0 ? Math.min(...values) : 0;
      case 'max':
        return values.length > 0 ? Math.max(...values) : 0;
      default:
        return 0;
    }
  }

  // Export report to PDF
  async exportToPDF(definition: ReportDefinition, result: ReportResult): Promise<Blob> {
    // In production, would use a PDF library like jsPDF or pdfkit
    // For now, return a simple text representation
    const content = this.formatReportAsText(definition, result);
    return new Blob([content], { type: 'text/plain' });
  }

  // Export report to Excel
  async exportToExcel(definition: ReportDefinition, result: ReportResult): Promise<Blob> {
    // Convert to CSV (in production, would use xlsx library)
    const csv = this.convertToCSV(result.data);
    return new Blob([csv], { type: 'text/csv' });
  }

  // Format report as text
  private formatReportAsText(definition: ReportDefinition, result: ReportResult): string {
    let text = `Report: ${definition.name}\n`;
    text += `Generated: ${result.metadata.generatedAt}\n`;
    text += `Records: ${result.metadata.recordCount}\n\n`;

    if (result.summary) {
      text += 'Summary:\n';
      if (result.summary.aggregates) {
        Object.entries(result.summary.aggregates).forEach(([field, value]) => {
          text += `  ${field}: ${value}\n`;
        });
      }
      text += '\n';
    }

    text += 'Data:\n';
    if (result.data.length > 0) {
      const headers = Object.keys(result.data[0]);
      text += headers.join('\t') + '\n';
      result.data.forEach(row => {
        text += headers.map(h => row[h]).join('\t') + '\n';
      });
    }

    return text;
  }

  // Convert data to CSV
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      rows.push(values.join(','));
    });

    return rows.join('\n');
  }

  // Save report definition
  async saveReportDefinition(definition: ReportDefinition, userId: string): Promise<ReportDefinition> {
    try {
      const { data, error } = await supabase
        .from('report_definitions')
        .insert({
          name: definition.name,
          description: definition.description,
          type: definition.type,
          data_source: definition.dataSource,
          fields: definition.fields,
          filters: definition.filters,
          grouping: definition.grouping,
          sorting: definition.sorting,
          format: definition.format,
          chart_type: definition.chartType,
          schedule: definition.schedule,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ReportDefinition;
    } catch (error: any) {
      console.error('Error saving report definition:', error);
      throw new Error(error.message || 'Failed to save report definition');
    }
  }

  // Get report definitions
  async getReportDefinitions(userId?: string): Promise<ReportDefinition[]> {
    try {
      let query = supabase.from('report_definitions').select('*').order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('created_by', userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        type: item.type,
        dataSource: item.data_source,
        fields: item.fields,
        filters: item.filters,
        grouping: item.grouping,
        sorting: item.sorting,
        format: item.format,
        chartType: item.chart_type,
        schedule: item.schedule,
        created_by: item.created_by,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    } catch (error: any) {
      console.error('Error fetching report definitions:', error);
      throw new Error(error.message || 'Failed to fetch report definitions');
    }
  }

  // Delete report definition
  async deleteReportDefinition(reportId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('report_definitions')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting report definition:', error);
      throw new Error(error.message || 'Failed to delete report definition');
    }
  }

  // Download report file
  downloadReport(content: string | Blob, filename: string, mimeType: string): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
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

export const reportService = ReportService.getInstance();

