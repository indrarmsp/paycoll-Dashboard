import { redirect } from 'next/navigation';
import { getRedirectPath } from '../lib/auth';
import { getServerSession } from '../lib/server-auth';

export default async function HomePage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  redirect(getRedirectPath(session.role));
}