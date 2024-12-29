export const defaultMetadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'NetWave - Connect, Share, Inspire',
    template: '%s | NetWave'
  },
  description: 'NetWave is a modern social networking platform where you can connect with friends, share moments, and build meaningful relationships.',
  keywords: [
    'social network',
    'social media',
    'networking',
    'community',
    'friends',
    'sharing',
    'photos',
    'videos',
    'posts',
    'connections'
  ],
  authors: [{ name: 'NetWave' }],
  creator: 'NetWave',
  publisher: 'NetWave',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://netwave.vercel.app',
    siteName: 'NetWave',
    title: 'NetWave - Connect, Share, Inspire',
    description: 'Join NetWave to connect with friends, share your moments, and be part of a vibrant community.',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'NetWave Social Network'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NetWave - Connect, Share, Inspire',
    description: 'Join NetWave to connect with friends, share your moments, and be part of a vibrant community.',
    images: ['/logo.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};
