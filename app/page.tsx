import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'SimchaPro | Jewish Wedding Planner & Simcha Checklist for the Frum Community',
  description: 'The complete simcha planner for the heimish and frum community. Organize your Chosson and Kallah planning with our wedding checklist, budget tracker, and vendor directory — built for Jewish weddings.',
};

export default function Home() {
  return <HomeClient />;
}