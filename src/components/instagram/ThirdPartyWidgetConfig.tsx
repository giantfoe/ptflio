import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Settings, Zap, Shield, Copy, Check } from 'lucide-react';
import { manualInstagramService, ThirdPartyWidgetConfig } from '@/utils/manual-instagram-service';
import { toast } from 'sonner';

interface ThirdPartyWidgetConfigProps {
  onConfigChange?: (config: ThirdPartyWidgetConfig | null) => void;
}

export default function ThirdPartyWidgetConfigComponent({ onConfigChange }: ThirdPartyWidgetConfigProps) {
  const [config, setConfig] = useState<ThirdPartyWidgetConfig | null>(null);
  const [embedCode, setEmbedCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load existing configuration
    const existingConfig = manualInstagramService.getWidgetConfig();
    if (existingConfig) {
      setConfig(existingConfig);
      generateEmbedCode(existingConfig);
    }
  }, []);

  const generateEmbedCode = (widgetConfig: ThirdPartyWidgetConfig) => {
    if (!widgetConfig.isEnabled) {
      setEmbedCode('');
      return;
    }

    const code = manualInstagramService.generateThirdPartyEmbed(widgetConfig);
    setEmbedCode(code);
  };

  const handleConfigUpdate = (updates: Partial<ThirdPartyWidgetConfig>) => {
    const newConfig = config ? { ...config, ...updates } : {
      provider: 'juicer' as const,
      isEnabled: false,
      ...updates
    };

    setConfig(newConfig);
    generateEmbedCode(newConfig);
    onConfigChange?.(newConfig);
  };

  const saveConfiguration = async () => {
    if (!config) return;

    setIsLoading(true);
    try {
      const success = manualInstagramService.saveWidgetConfig(config);
      if (success) {
        toast.success('Widget configuration saved successfully!');
      } else {
        toast.error('Failed to save widget configuration');
      }
    } catch (error) {
      toast.error('Error saving configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const copyEmbedCode = async () => {
    if (!embedCode) return;

    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success('Embed code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy embed code');
    }
  };

  const resetConfiguration = () => {
    setConfig(null);
    setEmbedCode('');
    onConfigChange?.(null);
    toast.info('Configuration reset');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Third-Party Widget Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure Instagram widgets from trusted third-party providers for automated content display.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={config?.provider || 'juicer'} onValueChange={(value) => handleConfigUpdate({ provider: value as 'juicer' | 'embedsocial' | 'custom' })}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="juicer">Juicer</TabsTrigger>
              <TabsTrigger value="embedsocial">EmbedSocial</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="juicer" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Juicer Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Social media aggregator with Instagram feed support
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      GDPR Compliant
                    </Badge>
                    <Badge variant="outline">
                      <Zap className="h-3 w-3 mr-1" />
                      Auto-sync
                    </Badge>
                  </div>
                </div>

                <Alert>
                  <ExternalLink className="h-4 w-4" />
                  <AlertDescription>
                    Get your Feed ID from{' '}
                    <a 
                      href="https://www.juicer.io/dashboard" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Juicer Dashboard
                    </a>
                    {' '}after connecting your Instagram account.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="juicer-feed-id">Feed ID</Label>
                  <Input
                    id="juicer-feed-id"
                    placeholder="your-feed-name"
                    value={config?.feedId || ''}
                    onChange={(e) => handleConfigUpdate({ feedId: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="juicer-enabled"
                    checked={config?.isEnabled || false}
                    onCheckedChange={(checked) => handleConfigUpdate({ isEnabled: checked })}
                  />
                  <Label htmlFor="juicer-enabled">Enable Juicer Widget</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="embedsocial" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">EmbedSocial Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Instagram widget with UGC collection and shoppable posts
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      GDPR Compliant
                    </Badge>
                    <Badge variant="outline">
                      <Zap className="h-3 w-3 mr-1" />
                      Official API
                    </Badge>
                  </div>
                </div>

                <Alert>
                  <ExternalLink className="h-4 w-4" />
                  <AlertDescription>
                    Get your Widget ID from{' '}
                    <a 
                      href="https://embedsocial.com/admin/instagram-widget" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      EmbedSocial Dashboard
                    </a>
                    {' '}after creating your Instagram widget.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="embedsocial-widget-id">Widget ID</Label>
                  <Input
                    id="embedsocial-widget-id"
                    placeholder="your-widget-id"
                    value={config?.widgetId || ''}
                    onChange={(e) => handleConfigUpdate({ widgetId: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="embedsocial-enabled"
                    checked={config?.isEnabled || false}
                    onCheckedChange={(checked) => handleConfigUpdate({ isEnabled: checked })}
                  />
                  <Label htmlFor="embedsocial-enabled">Enable EmbedSocial Widget</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Custom Widget</h3>
                  <p className="text-sm text-muted-foreground">
                    Use your own custom embed code from any Instagram widget provider
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-embed">Custom Embed Code</Label>
                  <Textarea
                    id="custom-embed"
                    placeholder="Paste your custom Instagram widget embed code here..."
                    value={config?.customEmbedCode || ''}
                    onChange={(e) => handleConfigUpdate({ customEmbedCode: e.target.value })}
                    rows={6}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="custom-enabled"
                    checked={config?.isEnabled || false}
                    onCheckedChange={(checked) => handleConfigUpdate({ isEnabled: checked })}
                  />
                  <Label htmlFor="custom-enabled">Enable Custom Widget</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4">
            <Button onClick={saveConfiguration} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
            <Button variant="outline" onClick={resetConfiguration}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {embedCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Generated Embed Code
            </CardTitle>
            <CardDescription>
              Copy this code and paste it into your website where you want the Instagram widget to appear.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{embedCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={copyEmbedCode}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Implementation Note:</strong> Make sure to test the widget on your website after implementation. 
                  Some widgets may require additional CSS styling or JavaScript initialization.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Provider Comparison</CardTitle>
          <CardDescription>
            Choose the best option for your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Juicer</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Multi-platform aggregation</li>
                <li>• Instagram Stories support</li>
                <li>• Customizable CTA buttons</li>
                <li>• Elementor integration</li>
                <li>• Free tier available</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">EmbedSocial</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Official Instagram API</li>
                <li>• Shoppable posts</li>
                <li>• UGC collection tools</li>
                <li>• Instagram Reels support</li>
                <li>• Advanced analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}