import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getOnboardingSeen } from '@/lib/auth/onboarding';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getOnboardingSeen()
      .then((value) => {
        if (!isMounted) return;
        setHasSeenOnboarding(value);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Menyiapkan Mediator..." />;
  }

  return <Redirect href={hasSeenOnboarding ? '/(tabs)/marketplace' : '/(auth)/welcome'} />;
}
