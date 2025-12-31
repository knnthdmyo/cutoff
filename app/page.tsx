import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to dashboard (or auth if not logged in)
  redirect('/dashboard');
}

