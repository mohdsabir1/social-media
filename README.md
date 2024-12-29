# Social Media Platform

A modern social media platform built with Next.js 14, featuring real-time interactions, responsive design, and a clean user interface.

## Features

- 🔐 User Authentication (Login/Signup)
- 👤 User Profiles
  - Profile Picture
  - Bio Information
  - Post Grid Layout
- 📱 Responsive Design
- 📝 Posts with Multiple Media
  - Image Support
  - Media Slider for Multiple Images
  - Like and Comment System
- 💬 Real-time Comments
- ❤️ Like System
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** MongoDB
- **Authentication:** NextAuth.js
- **Image Storage:** Cloudinary
- **State Management:** React Hooks

## Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd social-media
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add:
```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_nextauth_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
/src
  /app                 # App router pages
  /components         # Reusable components
    /ui              # UI components
    /post            # Post-related components
    /profile         # Profile-related components
  /lib               # Utility functions
  /models            # MongoDB models
  /hooks             # Custom React hooks
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [MongoDB](https://www.mongodb.com/)
- [Cloudinary](https://cloudinary.com/)
