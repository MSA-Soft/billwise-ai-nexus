import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useTableSubscription } from '@/hooks/useRealtime';
import { cn } from '@/lib/utils';

interface LiveDataTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
  }>;
  tableName: string;
  onDataChange?: (newData: T[]) => void;
  onRowUpdate?: (row: T) => void;
  onRowInsert?: (row: T) => void;
  onRowDelete?: (row: T) => void;
  title?: string;
  className?: string;
}

export const LiveDataTable = <T extends { id: string }>({
  data,
  columns,
  tableName,
  onDataChange,
  onRowUpdate,
  onRowInsert,
  onRowDelete,
  title,
  className,
}: LiveDataTableProps<T>) => {
  const [localData, setLocalData] = useState<T[]>(data);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Update local data when props change
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Subscribe to real-time updates
  useTableSubscription(
    tableName,
    '*',
    (payload) => {
      setLastUpdate(new Date());
      
      switch (payload.eventType) {
        case 'INSERT':
          if (onRowInsert) {
            onRowInsert(payload.new);
          }
          setLocalData(prev => [payload.new, ...prev]);
          break;
          
        case 'UPDATE':
          if (onRowUpdate) {
            onRowUpdate(payload.new);
          }
          setLocalData(prev =>
            prev.map(item => item.id === payload.new.id ? payload.new : item)
          );
          break;
          
        case 'DELETE':
          if (onRowDelete) {
            onRowDelete(payload.old);
          }
          setLocalData(prev =>
            prev.filter(item => item.id !== payload.old.id)
          );
          break;
      }
      
      if (onDataChange) {
        onDataChange(localData);
      }
    }
  );

  // Handle connection status
  useEffect(() => {
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Refresh data
  const handleRefresh = () => {
    setLastUpdate(new Date());
    // Trigger data refresh in parent component
    if (onDataChange) {
      onDataChange(localData);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle>{title || `${tableName} Data`}</CardTitle>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={!isConnected}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={String(column.key)}>
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {localData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                localData.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'transition-colors',
                      index === 0 && 'bg-muted/30' // Highlight new/updated rows
                    )}
                  >
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key] || '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
