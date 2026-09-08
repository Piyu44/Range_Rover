import './globals.css';

export const metadata = {
  title: 'Range Rover Animation',
  description: 'A scroll-controlled cinematic animation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
