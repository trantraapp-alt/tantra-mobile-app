// Reusable placeholder screen for routes whose feature is not yet implemented.
import { Hammer } from 'lucide-react-native';

import { EmptyState } from '@/components/empty-state';
import { Header } from '@/components/shared/Header';
import { Screen } from '@/components/ui';
import { useGoBack } from '@/hooks';

// Props for the ComingSoonScreen component.
export interface ComingSoonScreenProps {
  // Title shown in the header.
  title: string;
  // Optional description of the upcoming feature.
  description?: string;
}

// Renders a titled screen indicating the feature is under construction.
export function ComingSoonScreen({
  title,
  description = 'This feature is coming soon.',
}: ComingSoonScreenProps) {
  const goBack = useGoBack();

  return (
    <Screen padded={false}>
      <Header title={title} showBack onBack={goBack} />
      <EmptyState icon={Hammer} title={title} description={description} />
    </Screen>
  );
}
