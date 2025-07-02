import { useEffect, useState } from 'react';
import { AdminSyncService } from '../services/adminSyncService';
import { useAuth } from '../contexts/AuthContext';

export function useAdminSync() {
  const { user, isAdmin } = useAuth();
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Synchronisation automatique pour les utilisateurs
  useEffect(() => {
    if (user && !isAdmin) {
      const syncInterval = setInterval(async () => {
        setSyncStatus('syncing');
        try {
          await AdminSyncService.syncUserDataWithAdmin(user.id);
          setLastSync(new Date());
          setSyncStatus('success');
        } catch (error) {
          console.error('Erreur sync:', error);
          setSyncStatus('error');
        }
      }, 30000); // Sync toutes les 30 secondes

      // Sync initial
      AdminSyncService.syncUserDataWithAdmin(user.id);

      return () => clearInterval(syncInterval);
    }
  }, [user, isAdmin]);

  return {
    lastSync,
    syncStatus,
    forcSync: () => {
      if (user) {
        AdminSyncService.syncUserDataWithAdmin(user.id);
      }
    }
  };
}