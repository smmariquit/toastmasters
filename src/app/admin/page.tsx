// src/app/admin/page.tsx

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Database,
  Trash2,
} from 'lucide-react';
import {
  exportDatabaseAsText,
  importDatabaseFromText,
  resetDatabase,
  exportDatabase,
} from '@/lib/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminPage() {
  const [exportedData, setExportedData] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportDatabaseAsText();
    setExportedData(data);
    setMessage({ type: 'success', text: 'Data exported successfully! You can copy the text below or download as a file.' });
  };

  const handleDownload = () => {
    const data = exportDatabaseAsText();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toastmasters-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'File downloaded successfully!' });
  };

  const handleImport = () => {
    if (!importData.trim()) {
      setMessage({ type: 'error', text: 'Please paste or upload data to import.' });
      return;
    }

    const result = importDatabaseFromText(importData);
    if (result.success) {
      setMessage({ type: 'success', text: 'Data imported successfully! Refresh the page to see changes.' });
      setImportData('');
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to import data.' });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
      setMessage({ type: 'success', text: 'File loaded. Click "Import Data" to apply changes.' });
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Failed to read file.' });
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetDatabase();
    setShowResetDialog(false);
    setMessage({ type: 'success', text: 'Database reset to defaults! Refresh the page to see changes.' });
  };

  const getStats = () => {
    const db = exportDatabase();
    return {
      clubs: db.clubs.length,
      members: db.members.length,
      meetings: db.meetings.length,
      grammarianSessions: db.grammarianSessions.length,
      ahCounterSessions: db.ahCounterSessions.length,
      timerSessions: db.timerSessions.length,
    };
  };

  const stats = getStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#772432]">Admin Tools</h1>
        <p className="text-muted-foreground">
          Export, import, and manage your Toastmasters data
        </p>
      </div>

      {message && (
        <Alert
          className={`mb-6 ${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
          <AlertTitle>{message.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Database Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Statistics
          </CardTitle>
          <CardDescription>Current data in your local database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-[#772432]">{stats.clubs}</div>
              <div className="text-sm text-muted-foreground">Clubs</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-[#772432]">{stats.members}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-[#772432]">{stats.meetings}</div>
              <div className="text-sm text-muted-foreground">Meetings</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-[#772432]">{stats.timerSessions}</div>
              <div className="text-sm text-muted-foreground">Timer Sessions</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-[#772432]">{stats.ahCounterSessions}</div>
              <div className="text-sm text-muted-foreground">Ah Counter Sessions</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-[#772432]">{stats.grammarianSessions}</div>
              <div className="text-sm text-muted-foreground">Grammarian Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>
              Download your data as a JSON text file for backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleExport} className="bg-[#772432] hover:bg-[#8f3a48]">
                <FileText className="mr-2 h-4 w-4" />
                Show Data
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download File
              </Button>
            </div>

            {exportedData && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Exported Data (JSON)</label>
                <Textarea
                  value={exportedData}
                  readOnly
                  className="font-mono text-xs h-64"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
                <p className="text-xs text-muted-foreground">
                  Click to select all, then copy (Ctrl+C / Cmd+C)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
            <CardDescription>
              Restore data from a previously exported JSON file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json,.txt"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload JSON File
              </Button>
            </div>

            <div className="relative">
              <Separator className="my-4" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                OR
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Paste JSON Data</label>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your exported JSON data here..."
                className="font-mono text-xs h-40"
              />
            </div>

            <Button
              onClick={handleImport}
              disabled={!importData.trim()}
              className="w-full bg-[#004165] hover:bg-[#0a5a8a]"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Importing data will replace all existing data. Make sure to export
                your current data first if you want to keep it.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Reset Section */}
      <Card className="mt-6 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will delete your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This will delete all your data and reset the database to its default
                  state with only the two sample clubs. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReset}>
                  Yes, Reset Everything
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
