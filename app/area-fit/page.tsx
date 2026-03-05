import type { Metadata } from 'next';
import { AreaQuiz } from '@/components/AreaQuiz';

export const metadata: Metadata = {
  title: 'Which area of law suits you? · Commercial Awareness Daily',
  description:
    'Take our free 2-minute quiz to discover which legal practice area matches your personality, working style, and ambitions. M&A, disputes, banking, regulation, AI & Law, and more.',
};

export default function AreaFitPage() {
  return <AreaQuiz />;
}
