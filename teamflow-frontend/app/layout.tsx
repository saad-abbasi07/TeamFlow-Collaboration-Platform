import './globals.css';
import { AuthProvider } from './context/AuthContext';

export const metadata = {
  title: 'My App',
  description: 'Professional Task App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}