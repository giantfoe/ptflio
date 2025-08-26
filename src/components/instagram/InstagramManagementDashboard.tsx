import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Instagram, 
  Settings, 
  Plus, 
  BarChart3, 
  Users, 
  Zap,
  Shield,
  ExternalLink,
  Info
} from 'lucide-react';
import ManualInstagramPosts from '../admin/ManualInstagramPosts';
import ThirdPartyWidgetConfig from './ThirdPartyWidgetConfig';
import { manualInstagramService, ThirdPartyWidgetConfig as WidgetConfig } from '@/utils/manual-instagram-service';
import { toast } from 'sonner';

interface DashboardStats {
  totalPosts: number;
  activePosts: number;
  widgetEnabled: boolean;
  widgetProvider?: string;
}

export default function InstagramManagementDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    activePosts: 0,
    widgetEnabled: false
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);

  useEffect(() => {
    updateStats();
  }, []);

  const updateStats = () => {
    const posts = manualInstagramService.getManualPosts();
    const activePosts = manualInstagramService.getActivePosts();
    const config = manualInstagramService.getWidgetConfig();

    setStats({
      totalPosts: posts.length,
      activePosts: activePosts.length,
      widgetEnabled: config?.isEnabled || false,
      widgetProvider: config?.provider
    });

    setWidgetConfig(config);
  };

  const handleWidgetConfigChange = (config: WidgetConfig | null) => {
    setWidgetConfig(config);
    updateStats();
  };

  const handlePostsChange = () => {
    updateStats();
  };

  const exportConfiguration = () => {
    const posts = manualInstagramService.getManualPosts();
    const config = manualInstagramService.getWidgetConfig();
    
    const exportData = {
      manualPosts: posts,
      widgetConfig: config,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instagram-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Configuration exported successfully!');
  };

  const getRecommendation = () => {
    if (stats.widgetEnabled && stats.activePosts > 0) {
      return {
        type: 'success',
        title: 'Optimal Setup',
        message: 'You have both manual posts and a third-party widget configured. This provides the best balance of control and automation.'
      };
    } else if (stats.widgetEnabled) {
      return {
        type: 'info',
        title: 'Widget Only',
        message: 'You\'re using a third-party widget for automation. Consider adding some manual posts for key content you want to highlight.'
      };
    } else if (stats.activePosts > 0) {
      return {
        type: 'info',
        title: 'Manual Only',
        message: 'You\'re using manual posts for full control. Consider adding a third-party widget for automated content updates.'
      };
    } else {
      return {
        type: 'warning',
        title: 'No Configuration',
        message: 'Set up either manual posts or a third-party widget to start displaying Instagram content.'
      };
    }
  };

  const recommendation = getRecommendation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instagram Management</h1>
          <p className="text-muted-foreground">
            Manage your Instagram content display with manual curation and automated widgets
          </p>
        </div>
        <Button onClick={exportConfiguration} variant="outline">
          <ExternalLink className="h-4 w-4 mr-2" />
          Export Config
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="manual">Manual Posts</TabsTrigger>
          <TabsTrigger value="widgets">Third-Party Widgets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <Instagram className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                <p className="text-xs text-muted-foreground">
                  Manual posts configured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Posts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activePosts}</div>
                <p className="text-xs text-muted-foreground">
                  Currently displayed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Widget Status</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.widgetEnabled ? 'Active' : 'Inactive'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.widgetProvider ? `Using ${stats.widgetProvider}` : 'No widget configured'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">✓</div>
                <p className="text-xs text-muted-foreground">
                  GDPR compliant setup
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendation Alert */}
          <Alert className={`border-l-4 ${
            recommendation.type === 'success' ? 'border-l-green-500' :
            recommendation.type === 'warning' ? 'border-l-yellow-500' :
            'border-l-blue-500'
          }`}>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>{recommendation.title}:</strong> {recommendation.message}
            </AlertDescription>
          </Alert>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Manual Posts
                </CardTitle>
                <CardDescription>
                  Curate specific Instagram posts for display
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Perfect for highlighting key content, product launches, or important announcements.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('manual')} 
                    className="w-full"
                  >
                    Manage Manual Posts
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Third-Party Widgets
                </CardTitle>
                <CardDescription>
                  Automated Instagram feed integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Automatically display your latest Instagram content with GDPR-compliant widgets.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('widgets')} 
                    variant="outline" 
                    className="w-full"
                  >
                    Configure Widgets
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Implementation Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Approaches</CardTitle>
              <CardDescription>
                Choose the best strategy for your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Badge variant="outline">Manual Only</Badge>
                    <h4 className="font-medium">Full Control</h4>
                    <p className="text-sm text-muted-foreground">
                      Hand-pick every post for maximum control over your brand presentation.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Badge variant="outline">Widget Only</Badge>
                    <h4 className="font-medium">Automation</h4>
                    <p className="text-sm text-muted-foreground">
                      Set it and forget it with automated feeds that stay current.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Badge variant="default">Hybrid Approach</Badge>
                    <h4 className="font-medium">Best of Both</h4>
                    <p className="text-sm text-muted-foreground">
                      Combine manual curation with automated updates for optimal results.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <ManualInstagramPosts onPostsChange={handlePostsChange} />
        </TabsContent>

        <TabsContent value="widgets">
          <ThirdPartyWidgetConfig onConfigChange={handleWidgetConfigChange} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics & Insights
              </CardTitle>
              <CardDescription>
                Track your Instagram content performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Coming Soon:</strong> Analytics integration will be available in a future update. 
                    This will include engagement metrics, click-through rates, and performance insights.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Planned Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Post engagement tracking</li>
                      <li>• Click-through rate analysis</li>
                      <li>• Popular content identification</li>
                      <li>• Performance comparisons</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Current Metrics</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Total posts: {stats.totalPosts}</li>
                      <li>• Active posts: {stats.activePosts}</li>
                      <li>• Widget status: {stats.widgetEnabled ? 'Enabled' : 'Disabled'}</li>
                      <li>• Configuration: {stats.widgetProvider || 'Manual only'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}