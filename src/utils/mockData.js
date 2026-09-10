// CreatorIQ Mock Dataset Engine

export const CREATOR_PROFILE = {
  name: 'Mister Cat',
  handle: '@cat_boss',
  email: 'mistercat@creatoriq.app',
  avatar: '/cat_boss.png',
  niche: 'Feline Tech, AI & Creative Coding',
  tier: 'PRO Creator',
  totalFollowers: 1485000,
  followerGrowthPct: 14.8,
  avgEngagementRate: 6.42,
  monthlyRevenue: 42850,
  revenueGrowthPct: 22.4,
};

export const PLATFORMS = [
  { id: 'all', name: 'All Platforms', icon: 'Globe', color: '#00C897', count: '1.48M' },
  { id: 'youtube', name: 'YouTube', icon: 'Youtube', color: '#FF4757', count: '820K' },
  { id: 'instagram', name: 'Instagram', icon: 'Instagram', color: '#FF6B9D', count: '340K' },
  { id: 'facebook', name: 'Facebook', icon: 'Facebook', color: '#1877F2', count: '190K' },
  { id: 'twitter', name: 'X / Twitter', icon: 'Twitter', color: '#4A7CF7', count: '115K' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', color: '#7C5CFC', count: '45K' },
];

export const TIMEFRAMES = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
  { id: '1y', label: '1 Year' },
];

// Helper to generate performance trends over time
export const PERFORMANCE_SERIES = [
  { date: 'Aug 01', views: 42000, engagement: 5.2, revenue: 1120, followers: 1420000, youtubeViews: 25000, instaViews: 12000, fbViews: 5000 },
  { date: 'Aug 03', views: 58000, engagement: 5.8, revenue: 1450, followers: 1426000, youtubeViews: 32000, instaViews: 18000, fbViews: 8000 },
  { date: 'Aug 05', views: 51000, engagement: 5.4, revenue: 1300, followers: 1431000, youtubeViews: 28000, instaViews: 15000, fbViews: 8000 },
  { date: 'Aug 07', views: 76000, engagement: 6.9, revenue: 2100, followers: 1439000, youtubeViews: 45000, instaViews: 21000, fbViews: 10000 },
  { date: 'Aug 09', views: 89000, engagement: 7.4, revenue: 2650, followers: 1448000, youtubeViews: 52000, instaViews: 25000, fbViews: 12000 },
  { date: 'Aug 11', views: 64000, engagement: 6.1, revenue: 1800, followers: 1453000, youtubeViews: 38000, instaViews: 18000, fbViews: 8000 },
  { date: 'Aug 13', views: 92000, engagement: 7.8, revenue: 2900, followers: 1462000, youtubeViews: 56000, instaViews: 24000, fbViews: 12000 },
  { date: 'Aug 15', views: 115000, engagement: 8.5, revenue: 3800, followers: 1471000, youtubeViews: 71000, instaViews: 29000, fbViews: 15000 },
  { date: 'Aug 17', views: 108000, engagement: 8.1, revenue: 3400, followers: 1478000, youtubeViews: 65000, instaViews: 28000, fbViews: 15000 },
  { date: 'Aug 19', views: 124000, engagement: 8.9, revenue: 4100, followers: 1485000, youtubeViews: 74000, instaViews: 32000, fbViews: 18000 },
];

export const DEMOGRAPHICS = {
  ageGroup: [
    { range: '18-24', percentage: 28, male: 16, female: 12 },
    { range: '25-34', percentage: 46, male: 26, female: 20 },
    { range: '35-44', percentage: 17, male: 10, female: 7 },
    { range: '45-54', percentage: 6, male: 3, female: 3 },
    { range: '55+', percentage: 3, male: 2, female: 1 },
  ],
  gender: [
    { label: 'Male', percentage: 57, color: '#00C897' },
    { label: 'Female', percentage: 39, color: '#00D4FF' },
    { label: 'Non-Binary / Other', percentage: 4, color: '#FFB800' },
  ],
  countries: [
    { country: 'United States', code: 'US', percentage: 42, count: '623.7K', flag: '🇺🇸' },
    { country: 'United Kingdom', code: 'GB', percentage: 14, count: '207.9K', flag: '🇬🇧' },
    { country: 'Germany', code: 'DE', percentage: 9, count: '133.6K', flag: '🇩🇪' },
    { country: 'Canada', code: 'CA', percentage: 8, count: '118.8K', flag: '🇨🇦' },
    { country: 'India', code: 'IN', percentage: 7, count: '103.9K', flag: '🇮🇳' },
    { country: 'Australia', code: 'AU', percentage: 5, count: '74.2K', flag: '🇦🇺' },
    { country: 'Others', code: 'OTHER', percentage: 15, count: '222.9K', flag: '🌐' },
  ],
  peakHours: [
    { hour: '6 AM', engagement: 25 },
    { hour: '9 AM', engagement: 45 },
    { hour: '12 PM', engagement: 68 },
    { hour: '3 PM', engagement: 74 },
    { hour: '6 PM', engagement: 98 },
    { hour: '9 PM', engagement: 89 },
    { hour: '12 AM', engagement: 32 },
  ]
};

export const CONTENT_ITEMS = [
  {
    id: 'c1',
    title: 'Building an Autonomous AI Agent in 15 Minutes (Cat Boss Edition 🐾)',
    platform: 'youtube',
    format: 'Longform',
    publishDate: '2026-08-18',
    thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop&q=80',
    views: '248,500',
    viewsNum: 248500,
    likes: '18.4K',
    comments: '1,240',
    shares: '4.2K',
    engagementRate: '9.4%',
    revenue: '$4,820',
    avgWatchTime: '9m 42s',
    status: 'Viral',
  },
  {
    id: 'c2',
    title: 'Why Senior Devs switched to MisterCat UI in 2026 🐱',
    platform: 'youtube',
    format: 'Longform',
    publishDate: '2026-08-14',
    thumbnail: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=300&auto=format&fit=crop&q=80',
    views: '184,200',
    viewsNum: 184200,
    likes: '14.1K',
    comments: '890',
    shares: '2.8K',
    engagementRate: '8.1%',
    revenue: '$3,150',
    avgWatchTime: '7m 15s',
    status: 'Trending',
  },
  {
    id: 'c3',
    title: 'Top 5 Cat Tech Tricks You Wish You Knew Sooner ⚡️',
    platform: 'instagram',
    format: 'Reel',
    publishDate: '2026-08-16',
    thumbnail: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=300&auto=format&fit=crop&q=80',
    views: '312,000',
    viewsNum: 312000,
    likes: '29.8K',
    comments: '640',
    shares: '12.4K',
    engagementRate: '11.2%',
    revenue: '$1,200',
    avgWatchTime: '0m 45s',
    status: 'Viral',
  },
  {
    id: 'c4',
    title: 'A Day in the Life of MisterCat (@cat_boss)',
    platform: 'facebook',
    format: 'Reel',
    publishDate: '2026-08-17',
    thumbnail: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=300&auto=format&fit=crop&q=80',
    views: '420,000',
    viewsNum: 420000,
    likes: '48.5K',
    comments: '1,890',
    shares: '15.1K',
    engagementRate: '13.5%',
    revenue: '$850',
    avgWatchTime: '0m 32s',
    status: 'Viral',
  },
  {
    id: 'c5',
    title: 'The Unspoken Cat Boss Architecture Rule 🧵',
    platform: 'twitter',
    format: 'Thread',
    publishDate: '2026-08-15',
    thumbnail: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=300&auto=format&fit=crop&q=80',
    views: '95,400',
    viewsNum: 95400,
    likes: '6.2K',
    comments: '410',
    shares: '1.9K',
    engagementRate: '7.8%',
    revenue: '$450',
    avgWatchTime: 'N/A',
    status: 'Normal',
  },
  {
    id: 'c6',
    title: 'Mastering Recharts & Chart.js for Cat Boss Dashboard',
    platform: 'youtube',
    format: 'Longform',
    publishDate: '2026-08-10',
    thumbnail: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=300&auto=format&fit=crop&q=80',
    views: '112,000',
    viewsNum: 112000,
    likes: '8.9K',
    comments: '530',
    shares: '1.2K',
    engagementRate: '6.5%',
    revenue: '$2,100',
    avgWatchTime: '11m 04s',
    status: 'Evergreen',
  },
];

export const REVENUE_STREAMS = [
  { name: 'Brand Sponsorships', value: 24500, percentage: 57, color: '#00C897' },
  { name: 'YouTube AdSense', value: 9800, percentage: 23, color: '#00D4FF' },
  { name: 'Affiliate Commissions', value: 4200, percentage: 10, color: '#7C5CFC' },
  { name: 'Digital Products & Courses', value: 3100, percentage: 7, color: '#FF6B9D' },
  { name: 'Fan Subscriptions / Membership', value: 1250, percentage: 3, color: '#FFB800' },
];

export const MONTHLY_REVENUE_TREND = [
  { month: 'Mar', sponsorships: 14000, adsense: 6200, affiliates: 2400, products: 1800 },
  { month: 'Apr', sponsorships: 16500, adsense: 6800, affiliates: 2900, products: 2100 },
  { month: 'May', sponsorships: 18200, adsense: 7500, affiliates: 3100, products: 2400 },
  { month: 'Jun', sponsorships: 21000, adsense: 8400, affiliates: 3600, products: 2700 },
  { month: 'Jul', sponsorships: 22800, adsense: 9100, affiliates: 3900, products: 2900 },
  { month: 'Aug', sponsorships: 24500, adsense: 9800, affiliates: 4200, products: 3100 },
];

export const SPONSOR_DEALS = [
  { id: 'd1', brand: 'Vercel', tier: 'Primary Sponsor', amount: '$12,000', deliverable: '2x YouTube Mid-rolls + X Post', status: 'Active', payoutDate: 'Aug 28, 2026' },
  { id: 'd2', brand: 'Linear', tier: 'Dedicated Integration', amount: '$8,500', deliverable: '1x Full Video Review', status: 'In Review', payoutDate: 'Sep 05, 2026' },
  { id: 'd3', brand: 'Supabase', tier: 'Platform Partner', amount: '$6,000', deliverable: '3x Instagram Reels', status: 'Completed', payoutDate: 'Aug 12, 2026' },
  { id: 'd4', brand: 'Raycast', tier: 'Tooling Feature', amount: '$4,500', deliverable: 'Dedicated Newsletter & Reel', status: 'Negotiating', payoutDate: 'Pending' },
];

export const RECENT_NOTIFICATIONS = [
  { id: 'n1', title: 'New Sponsor Inquiry', desc: 'JetBrains requested a Q4 Video Sponsorship quote for MisterCat.', time: '10m ago', unread: true, type: 'deal' },
  { id: 'n2', title: 'Milestone Unlocked! 🎉', desc: '@cat_boss channel passed 800,000 subscribers.', time: '2h ago', unread: true, type: 'milestone' },
  { id: 'n3', title: 'Payout Processed', desc: '$12,000 from Vercel deposited to MisterCat.', time: '1d ago', unread: false, type: 'finance' },
  { id: 'n4', title: 'High Engagement Alert', desc: 'Latest Instagram Reel by @cat_boss is performing 3.2x above average.', time: '2d ago', unread: false, type: 'alert' },
];
