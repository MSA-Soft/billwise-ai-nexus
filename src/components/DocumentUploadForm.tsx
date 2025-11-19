import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  Download
} from 'lucide-react';

interface DocumentUploadFormProps {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (document: any) => void;
}

export function DocumentUploadForm({ patientId, patientName, isOpen, onClose, onUpload }: DocumentUploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Document Details
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!documentType.trim()) newErrors.documentType = 'Document type is required';
    if (!documentName.trim()) newErrors.documentName = 'Document name is required';
    if (!file) newErrors.file = 'File is required';
    if (!uploadedBy.trim()) newErrors.uploadedBy = 'Uploaded by is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Generate preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const document = {
        patientId,
        patientName,
        documentType,
        documentName,
        description,
        uploadedBy,
        uploadDate,
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type,
        file: file, // In real app, this would be uploaded to storage
        timestamp: new Date().toISOString()
      };

      onUpload(document);
      
      // Reset form
      setDocumentType('');
      setDocumentName('');
      setDescription('');
      setUploadedBy('');
      setUploadDate(new Date().toISOString().split('T')[0]);
      setFile(null);
      setFilePreview(null);
      setErrors({});
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setErrors({});
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-8 w-8 text-blue-600" />;
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-600" />;
    return <File className="h-8 w-8 text-gray-600" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Upload className="h-6 w-6 mr-2 text-blue-600" />
            Upload Document - {patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Document Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger className={errors.documentType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lab-report">Lab Report</SelectItem>
                      <SelectItem value="imaging">Imaging Report</SelectItem>
                      <SelectItem value="insurance-card">Insurance Card</SelectItem>
                      <SelectItem value="id-document">ID Document</SelectItem>
                      <SelectItem value="medical-record">Medical Record</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="consent-form">Consent Form</SelectItem>
                      <SelectItem value="discharge-summary">Discharge Summary</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.documentType && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.documentType}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentName">Document Name *</Label>
                  <Input
                    id="documentName"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Enter document name"
                    className={errors.documentName ? 'border-red-500' : ''}
                  />
                  {errors.documentName && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.documentName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uploadedBy">Uploaded By *</Label>
                  <Input
                    id="uploadedBy"
                    value={uploadedBy}
                    onChange={(e) => setUploadedBy(e.target.value)}
                    placeholder="Dr. Smith"
                    className={errors.uploadedBy ? 'border-red-500' : ''}
                  />
                  {errors.uploadedBy && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.uploadedBy}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uploadDate">Upload Date</Label>
                  <Input
                    id="uploadDate"
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the document..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Upload className="h-5 w-5 mr-2 text-green-600" />
                File Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Select File *</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                    className={errors.file ? 'border-red-500' : ''}
                  />
                  {errors.file && (
                    <p className="text-sm text-red-600 flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      {errors.file}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG, GIF, TXT (Max 10MB)
                  </p>
                </div>

                {/* File Preview */}
                {file && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setFile(null);
                            setFilePreview(null);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Image Preview */}
                    {filePreview && (
                      <div className="mt-4">
                        <img 
                          src={filePreview} 
                          alt="Preview" 
                          className="max-w-full h-48 object-contain rounded border"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload Summary */}
          {file && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Plus className="h-5 w-5 mr-2 text-purple-600" />
                  Upload Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-medium">{patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Document Type:</span>
                    <span className="font-medium">{documentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Document Name:</span>
                    <span className="font-medium">{documentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File:</span>
                    <span className="font-medium">{file.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uploaded By:</span>
                    <span className="font-medium">{uploadedBy}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
