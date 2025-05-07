'use client';
import { Geist, Geist_Mono } from 'next/font/google';
// import "../globals.css";

import { useAuthStore } from '@/stores/authStore';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import useCartStore from '@/stores/useCartStore';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [hasHydrated, setHasHydrated] = useState(false);

  const authPersist = useAuthStore.persist;
  const cartPersist = useCartStore.persist;

  useEffect(() => {
    let authHydrated = authPersist.hasHydrated();
    let cartHydrated = cartPersist.hasHydrated();
    const checkAllHydrated = () => {
      if (authHydrated && cartHydrated) {
        setHasHydrated(true);
      }
    };

    if (!authHydrated || !cartHydrated) {
      const unsubAuth = authPersist.onHydrate(() => {
        authHydrated = true;
        checkAllHydrated();
      });

      const unsubCart = cartPersist.onHydrate(() => {
        cartHydrated = true;
        checkAllHydrated();
      });

      authPersist.rehydrate();
      cartPersist.rehydrate();

      return () => {
        unsubAuth();
        unsubCart();
      };
    } else {
      setHasHydrated(true);
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {hasHydrated ? (
          <>
            {children}
            <Toaster />
          </>
        ) : null}
      </body>
    </html>
  );
}
