import { AppShell } from '../../components/app-shell';
import { UpdateClient } from '../../components/update-client';
import { buildAdminNavItems } from '../../lib/nav-items';
import { requireServerSession } from '../../lib/server-auth';

export default async function UpdatePage() {
  await requireServerSession(['admin']);

  return (
    <AppShell
      sidebarTitle="Payment Collective"
      headerTitle="Update Data"
      avatarLabel="Admin"
      avatarName="Admin"
      navItems={buildAdminNavItems('update')}
    >
      <UpdateClient />
    </AppShell>
  );
}
