// app/page.tsx
import type { Metadata } from 'next';
import { homeMetadata } from './metadata';
import HomeClient from '@/components/HomeClient';

// Export metadata for Next.js App Router
export const metadata: Metadata = homeMetadata;

// Server Component - static and fast
export default function Home() {
  return <HomeClient />;
}