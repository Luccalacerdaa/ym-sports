import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationLogger } from '@/utils/notificationLogger';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bug, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info,
  Eye,
  EyeOff
} from 'lucide-react';

export const NotificationDebugger: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Carregar logs
  const loadLogs = () => {
    const currentLogs = NotificationLogger.getLogs();
    setLogs(currentLogs);
  };

  // Auto-refresh dos logs
  useEffect(() => {
    loadLogs();
    
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 2000); // Atualizar a cada 2 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Limpar logs
  const clearLogs = () => {
    NotificationLogger.clearLogs();
    setLogs([]);
  };

  // Exportar logs
  const exportLogs = () => {
    const logText = NotificationLogger.exportLogs();
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ym-sports-notification-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Verificar status do sistema
  const checkSystemStatus = async () => {
    await NotificationLogger.checkNotificationStatus();
    loadLogs();
  };

  // Ícone por nível de log
  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // Cor do badge por nível
  const getBadgeVariant = (level: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'warn':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug Logs
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh]">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Bug className="h-4 w-4 mr-2" />
              Debug Notificações
              <Badge variant="outline" className="ml-2">
                {logs.length} logs
              </Badge>
            </CardTitle>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={loadLogs}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Atualizar
            </Button>
            
            <Button
              onClick={checkSystemStatus}
              variant="outline"
              size="sm"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Status
            </Button>
            
            <Button
              onClick={exportLogs}
              variant="outline"
              size="sm"
              disabled={logs.length === 0}
            >
              <Download className="h-3 w-3 mr-1" />
              Exportar
            </Button>
            
            <Button
              onClick={clearLogs}
              variant="outline"
              size="sm"
              disabled={logs.length === 0}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-3 h-3"
              />
              Auto-refresh
            </label>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <ScrollArea className="h-96">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                <Bug className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Nenhum log disponível
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 text-xs bg-card/50"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getLogIcon(log.level)}
                        <Badge variant={getBadgeVariant(log.level)} className="text-xs">
                          {log.source}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {log.timestamp}
                      </span>
                    </div>
                    
                    <div className="font-medium mb-1">
                      {log.message}
                    </div>
                    
                    {log.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Ver dados
                        </summary>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
