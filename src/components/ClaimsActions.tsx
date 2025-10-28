import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Download, 
  Upload, 
  RefreshCw,
  Filter,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface ClaimsActionsProps {
  onNewClaim: () => void;
}

export function ClaimsActions({ onNewClaim }: ClaimsActionsProps) {
  return (
    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 text-gray-700"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      
      <Button
        variant="outline"
        className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 text-gray-700"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
      
      <Button
        variant="outline"
        className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 text-gray-700"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
      
      <Button
        variant="outline"
        className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-gray-50 text-gray-700"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>
      
      <Button
        onClick={onNewClaim}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Claim
      </Button>
    </div>
  );
}
