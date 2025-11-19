import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Download, Users, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { bulkOperationsService, type BulkOperationResults } from '@/services/bulkOperationsService';

interface BulkOperationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: string[];
  targetType: 'tasks' | 'claims' | 'authorizations';
  onComplete?: () => void;
}

export function BulkOperationsDialog({
  open,
  onOpenChange,
  selectedItems,
  targetType,
  onComplete,
}: BulkOperationsDialogProps) {
  const { toast } = useToast();
  const [operation, setOperation] = useState<'status_update' | 'assignment' | 'export' | 'delete'>('status_update');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BulkOperationResults | null>(null);

  // Status update fields
  const [newStatus, setNewStatus] = useState('');
  
  // Assignment fields
  const [assignedTo, setAssignedTo] = useState('');

  // Export fields
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json'>('csv');

  const handleExecute = async () => {
    try {
      setLoading(true);
      setResults(null);

      let operationResults: BulkOperationResults;

      switch (operation) {
        case 'status_update':
          if (!newStatus) {
            toast({
              title: 'Error',
              description: 'Please select a status',
              variant: 'destructive',
            });
            return;
          }
          operationResults = await bulkOperationsService.bulkUpdateStatus(
            targetType,
            selectedItems,
            newStatus,
            'current-user-id' // Would get from auth context
          );
          break;

        case 'assignment':
          if (!assignedTo) {
            toast({
              title: 'Error',
              description: 'Please enter user ID to assign to',
              variant: 'destructive',
            });
            return;
          }
          operationResults = await bulkOperationsService.bulkAssign(
            targetType,
            selectedItems,
            assignedTo,
            'current-user-id'
          );
          break;

        case 'export':
          const exportResult = await bulkOperationsService.bulkExport(
            targetType,
            selectedItems,
            exportFormat
          );
          bulkOperationsService.downloadFile(
            exportResult.data,
            exportResult.filename,
            exportFormat === 'json' ? 'application/json' : 'text/csv'
          );
          toast({
            title: 'Export Complete',
            description: `Exported ${selectedItems.length} items to ${exportResult.filename}`,
          });
          onOpenChange(false);
          return;

        case 'delete':
          if (!confirm(`Are you sure you want to delete ${selectedItems.length} items? This cannot be undone.`)) {
            return;
          }
          operationResults = await bulkOperationsService.bulkDelete(
            targetType,
            selectedItems,
            'current-user-id'
          );
          break;

        default:
          return;
      }

      setResults(operationResults);

      if (operationResults.successful > 0) {
        toast({
          title: 'Operation Complete',
          description: `Successfully processed ${operationResults.successful} of ${operationResults.total} items`,
        });
      }

      if (operationResults.failed > 0) {
        toast({
          title: 'Partial Success',
          description: `${operationResults.failed} items failed to process`,
          variant: 'destructive',
        });
      }

      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      toast({
        title: 'Operation Failed',
        description: error.message || 'Bulk operation failed',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusOptions = () => {
    switch (targetType) {
      case 'tasks':
        return ['pending', 'in_progress', 'on_hold', 'completed', 'cancelled'];
      case 'claims':
        return ['draft', 'submitted', 'processing', 'paid', 'denied'];
      case 'authorizations':
        return ['draft', 'submitted', 'pending', 'approved', 'denied', 'expired'];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Bulk Operations - {selectedItems.length} {targetType}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Operation Selection */}
          <div>
            <Label>Operation Type</Label>
            <Select value={operation} onValueChange={(value: any) => setOperation(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status_update">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Update Status
                  </div>
                </SelectItem>
                <SelectItem value="assignment">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assign To
                  </div>
                </SelectItem>
                <SelectItem value="export">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </div>
                </SelectItem>
                <SelectItem value="delete">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Update Fields */}
          {operation === 'status_update' && (
            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {getStatusOptions().map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Assignment Fields */}
          {operation === 'assignment' && (
            <div>
              <Label>Assign To (User ID)</Label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Enter user ID"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          )}

          {/* Export Fields */}
          {operation === 'export' && (
            <div>
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Results */}
          {results && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Total:</span>
                    <span className="font-medium">{results.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-green-600">
                    <span>Successful:</span>
                    <span className="font-medium">{results.successful}</span>
                  </div>
                  <div className="flex items-center justify-between text-red-600">
                    <span>Failed:</span>
                    <span className="font-medium">{results.failed}</span>
                  </div>
                  {results.errors.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium mb-1">Errors:</div>
                      <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                        {results.errors.map((error, index) => (
                          <div key={index} className="text-red-600">
                            {error.id}: {error.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExecute}
              disabled={loading || (operation === 'status_update' && !newStatus) || (operation === 'assignment' && !assignedTo)}
            >
              {loading ? 'Processing...' : 'Execute'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

