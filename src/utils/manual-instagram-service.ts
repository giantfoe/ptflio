import { createApiLogger } from './logger';

export interface ManualInstagramPost {
  id: string;
  url: string;
  title?: string;
  description?: string;
  isActive: boolean;
  addedAt: string;
  embedCode?: string;
  postId?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
}

// Juicer feed item interface
export interface JuicerFeedItem {
  id: string;
  external_id: string;
  source: {
    source: string;
    term: string;
  };
  full: string;
  message: string;
  image: string;
  external_created_at: string;
  edit: string;
  unformatted: {
    message: string;
    full: string;
    image: string;
    video?: string;
  };
}

// Juicer API response interface
export interface JuicerApiResponse {
  posts: JuicerFeedItem[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface ManualInstagramEmbed {
  id: string;
  url: string;
  embedCode: string;
  embedType: 'blockquote' | 'iframe' | 'oembed';
  isValid: boolean;
  lastValidated?: string;
  metadata?: {
    postId: string;
    mediaType?: string;
    caption?: string;
    timestamp?: string;
  };
}

export interface ThirdPartyWidgetConfig {
  provider: 'juicer' | 'embedsocial' | 'custom';
  apiKey?: string;
  feedId?: string;
  widgetId?: string;
  customEmbedCode?: string;
  isEnabled: boolean;
}

class ManualInstagramService {
  private logger = createApiLogger('ManualInstagramService');
  private storageKey = 'manualInstagramPosts';
  private widgetConfigKey = 'instagramWidgetConfig';

  /**
   * Validates Instagram URL format
   */
  isValidInstagramUrl(url: string): boolean {
    const patterns = [
      /^https:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+\/?$/,
      /^https:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+\/?$/,
      /^https:\/\/(www\.)?instagram\.com\/tv\/[A-Za-z0-9_-]+\/?$/
    ];
    
    return patterns.some(pattern => pattern.test(url));
  }

  /**
   * Extracts post ID from Instagram URL
   */
  extractPostId(url: string): string | null {
    const match = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
    return match ? match[2] : null;
  }

  /**
   * Determines media type from URL
   */
  getMediaTypeFromUrl(url: string): 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' {
    if (url.includes('/reel/') || url.includes('/tv/')) {
      return 'VIDEO';
    }
    // Default to IMAGE for posts (could be carousel)
    return 'IMAGE';
  }

  /**
   * Generates different types of embed codes
   */
  generateEmbedCode(url: string, type: 'blockquote' | 'iframe' | 'oembed' = 'blockquote'): string {
    const postId = this.extractPostId(url);
    
    switch (type) {
      case 'blockquote':
        return `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:16px;"> <a href="${url}" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank"> <div style="display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style="color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style="width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style="width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style="background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style="width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div></a><p style="color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;"><a href="${url}" style="color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;" target="_blank">A post shared by Instagram</a></p></div></blockquote>`;
      
      case 'iframe':
        return `<iframe src="${url}embed/" width="400" height="480" frameborder="0" scrolling="no" allowtransparency="true"></iframe>`;
      
      case 'oembed':
        return `<!-- oEmbed placeholder for ${url} -->`;
      
      default:
        return this.generateEmbedCode(url, 'blockquote');
    }
  }

  /**
   * Validates embed code by checking if it contains required Instagram elements
   */
  validateEmbedCode(embedCode: string): boolean {
    const requiredElements = [
      'instagram-media',
      'data-instgrm-permalink',
      'instagram.com'
    ];
    
    return requiredElements.some(element => embedCode.includes(element));
  }

  /**
   * Gets all manual Instagram posts from localStorage
   */
  getManualPosts(): ManualInstagramPost[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      const posts = JSON.parse(stored) as ManualInstagramPost[];
      return posts.filter(post => post && post.id && post.url);
    } catch (error) {
      this.logger.error('Failed to load manual Instagram posts', { error });
      return [];
    }
  }

  /**
   * Gets only active manual Instagram posts
   */
  getActivePosts(): ManualInstagramPost[] {
    return this.getManualPosts().filter(post => post.isActive);
  }

  /**
   * Saves manual Instagram posts to localStorage
   */
  saveManualPosts(posts: ManualInstagramPost[]): boolean {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(posts));
      this.logger.info('Manual Instagram posts saved', { count: posts.length });
      return true;
    } catch (error) {
      this.logger.error('Failed to save manual Instagram posts', { error });
      return false;
    }
  }

  /**
   * Adds a new manual Instagram post
   */
  addManualPost(url: string, title?: string, description?: string): ManualInstagramPost | null {
    if (!this.isValidInstagramUrl(url)) {
      this.logger.warn('Invalid Instagram URL provided', { url });
      return null;
    }

    const postId = this.extractPostId(url);
    if (!postId) {
      this.logger.warn('Could not extract post ID from URL', { url });
      return null;
    }

    const existingPosts = this.getManualPosts();
    const existingPost = existingPosts.find(post => post.postId === postId);
    
    if (existingPost) {
      this.logger.warn('Post already exists', { postId, url });
      return null;
    }

    const newPost: ManualInstagramPost = {
      id: `manual_${Date.now()}_${postId}`,
      url: url.trim(),
      title: title?.trim(),
      description: description?.trim(),
      isActive: true,
      addedAt: new Date().toISOString(),
      embedCode: this.generateEmbedCode(url),
      postId,
      mediaType: this.getMediaTypeFromUrl(url)
    };

    const updatedPosts = [...existingPosts, newPost];
    
    if (this.saveManualPosts(updatedPosts)) {
      this.logger.info('Manual Instagram post added', { postId, url });
      return newPost;
    }

    return null;
  }

  /**
   * Removes a manual Instagram post
   */
  removeManualPost(postId: string): boolean {
    const existingPosts = this.getManualPosts();
    const updatedPosts = existingPosts.filter(post => post.id !== postId);
    
    if (updatedPosts.length === existingPosts.length) {
      this.logger.warn('Post not found for removal', { postId });
      return false;
    }

    if (this.saveManualPosts(updatedPosts)) {
      this.logger.info('Manual Instagram post removed', { postId });
      return true;
    }

    return false;
  }

  /**
   * Toggles the active status of a manual Instagram post
   */
  togglePostStatus(postId: string): boolean {
    const existingPosts = this.getManualPosts();
    const postIndex = existingPosts.findIndex(post => post.id === postId);
    
    if (postIndex === -1) {
      this.logger.warn('Post not found for status toggle', { postId });
      return false;
    }

    existingPosts[postIndex].isActive = !existingPosts[postIndex].isActive;
    
    if (this.saveManualPosts(existingPosts)) {
      this.logger.info('Manual Instagram post status toggled', { 
        postId, 
        newStatus: existingPosts[postIndex].isActive 
      });
      return true;
    }

    return false;
  }

  /**
   * Gets third-party widget configuration
   */
  getWidgetConfig(): ThirdPartyWidgetConfig | null {
    try {
      const stored = localStorage.getItem(this.widgetConfigKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      this.logger.error('Failed to load widget configuration', { error });
      return null;
    }
  }

  /**
   * Saves third-party widget configuration
   */
  saveWidgetConfig(config: ThirdPartyWidgetConfig): boolean {
    try {
      localStorage.setItem(this.widgetConfigKey, JSON.stringify(config));
      this.logger.info('Widget configuration saved', { provider: config.provider });
      return true;
    } catch (error) {
      this.logger.error('Failed to save widget configuration', { error });
      return false;
    }
  }

  /**
   * Generates embed code for third-party widgets
   */
  generateThirdPartyEmbed(config: ThirdPartyWidgetConfig): string {
    switch (config.provider) {
      case 'juicer':
        return config.feedId 
          ? `<script src="https://assets.juicer.io/embed.js" type="text/javascript"></script><link href="https://assets.juicer.io/embed.css" media="all" rel="stylesheet" type="text/css" /><ul class="juicer-feed" data-feed-id="${config.feedId}"></ul>`
          : '';
      
      case 'embedsocial':
        return config.widgetId 
          ? `<div class="embedsocial-instagram" data-ref="${config.widgetId}"></div><script>(function(d, s, id){var js; if (d.getElementById(id)) {return;} js = d.createElement(s); js.id = id; js.src = "https://embedsocial.com/cdn/ht.js"; d.getElementsByTagName("head")[0].appendChild(js);}(document, "script", "EmbedSocialInstagramScript"));</script>`
          : '';
      
      case 'custom':
        return config.customEmbedCode || '';
      
      default:
        return '';
    }
  }

  /**
   * Fetches posts from Juicer feed
   */
  async fetchJuicerFeed(feedId: string = 'ayorinde_john', page: number = 1, perPage: number = 20): Promise<JuicerFeedItem[]> {
    try {
      const response = await fetch(`https://www.juicer.io/api/feeds/${feedId}?page=${page}&per=${perPage}`);
      
      if (!response.ok) {
        throw new Error(`Juicer API error: ${response.status} ${response.statusText}`);
      }
      
      const data: JuicerApiResponse = await response.json();
      
      // Filter for Instagram posts only
      const instagramPosts = data.posts.filter(post => 
        post.source.source === 'Instagram' || 
        post.edit?.includes('instagram.com') ||
        post.unformatted?.full?.includes('instagram.com')
      );
      
      this.logger.info('Juicer feed fetched successfully', {
        feedId,
        totalPosts: data.posts.length,
        instagramPosts: instagramPosts.length,
        page,
        perPage
      });
      
      return instagramPosts;
    } catch (error) {
      this.logger.error('Failed to fetch Juicer feed', { feedId, error });
      return [];
    }
  }

  /**
   * Converts Juicer feed items to ManualInstagramPost format
   */
  convertJuicerToManualPosts(juicerItems: JuicerFeedItem[]): ManualInstagramPost[] {
    return juicerItems.map(item => {
      // Extract Instagram URL from the edit field or unformatted data
      const instagramUrl = this.extractInstagramUrlFromJuicer(item);
      const postId = this.extractPostId(instagramUrl) || item.external_id;
      
      return {
        id: `juicer_${item.id}`,
        url: instagramUrl,
        title: this.truncateText(item.message || item.unformatted?.message, 100),
        description: item.full || item.unformatted?.full,
        isActive: true,
        addedAt: item.external_created_at,
        embedCode: this.generateEmbedCode(instagramUrl),
        postId,
        mediaType: item.unformatted?.video ? 'VIDEO' : 'IMAGE'
      };
    });
  }

  /**
   * Extracts Instagram URL from Juicer item
   */
  private extractInstagramUrlFromJuicer(item: JuicerFeedItem): string {
    // Try to extract from edit field first
    if (item.edit && item.edit.includes('instagram.com')) {
      const urlMatch = item.edit.match(/https?:\/\/(?:www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+\/?/);
      if (urlMatch) return urlMatch[0];
    }
    
    // Try to extract from unformatted.full
    if (item.unformatted?.full && item.unformatted.full.includes('instagram.com')) {
      const urlMatch = item.unformatted.full.match(/https?:\/\/(?:www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+\/?/);
      if (urlMatch) return urlMatch[0];
    }
    
    // Fallback: construct URL from external_id if it looks like an Instagram post ID
    if (item.external_id && /^[A-Za-z0-9_-]+$/.test(item.external_id)) {
      return `https://www.instagram.com/p/${item.external_id}/`;
    }
    
    // Last resort: return a placeholder
    return `https://www.instagram.com/p/${item.id}/`;
  }

  /**
   * Truncates text to specified length
   */
  private truncateText(text: string | undefined, maxLength: number): string | undefined {
    if (!text) return undefined;
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  }

  /**
   * Gets combined posts from manual entries and Juicer feed
   */
  async getCombinedPosts(includeJuicer: boolean = true, juicerFeedId?: string): Promise<ManualInstagramPost[]> {
    const manualPosts = this.getActivePosts();
    
    if (!includeJuicer) {
      return manualPosts;
    }
    
    try {
      const juicerItems = await this.fetchJuicerFeed(juicerFeedId);
      const juicerPosts = this.convertJuicerToManualPosts(juicerItems);
      
      // Combine and deduplicate based on URL
      const allPosts = [...manualPosts, ...juicerPosts];
      const uniquePosts = allPosts.filter((post, index, self) => 
        index === self.findIndex(p => p.url === post.url)
      );
      
      // Sort by date, newest first
      return uniquePosts.sort((a, b) => 
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
    } catch (error) {
      this.logger.error('Failed to get combined posts', { error });
      return manualPosts;
    }
  }

  /**
   * Converts manual posts to a format compatible with existing media grid
   */
  convertToMediaItems(): Array<{
    id: string;
    type: 'instagram';
    url: string;
    thumbnail?: string;
    title?: string;
    description?: string;
    embedCode?: string;
    isManual: boolean;
  }> {
    const activePosts = this.getActivePosts();
    
    return activePosts.map(post => ({
      id: post.id,
      type: 'instagram' as const,
      url: post.url,
      title: post.title,
      description: post.description,
      embedCode: post.embedCode,
      isManual: true
    }));
  }

  /**
   * Converts combined posts (manual + Juicer) to media items
   */
  async convertCombinedToMediaItems(includeJuicer: boolean = true, juicerFeedId?: string): Promise<Array<{
    id: string;
    type: 'instagram';
    url: string;
    thumbnail?: string;
    title?: string;
    description?: string;
    embedCode?: string;
    isManual: boolean;
    isFromJuicer?: boolean;
  }>> {
    const combinedPosts = await this.getCombinedPosts(includeJuicer, juicerFeedId);
    
    return combinedPosts.map(post => ({
      id: post.id,
      type: 'instagram' as const,
      url: post.url,
      title: post.title,
      description: post.description,
      embedCode: post.embedCode,
      isManual: !post.id.startsWith('juicer_'),
      isFromJuicer: post.id.startsWith('juicer_')
    }));
  }
}

// Export singleton instance
export const manualInstagramService = new ManualInstagramService();
export default ManualInstagramService;