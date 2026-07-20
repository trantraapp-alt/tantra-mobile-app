// Chat screen: entry point for buyer/seller conversations.
import { MessagesSquare } from 'lucide-react-native';

import { EmptyState } from '@/components/empty-state';
import { Header } from '@/components/shared';
import { Screen } from '@/components/ui';
import { useTranslation } from '@/hooks';

// Renders the chat screen.
export function ChatScreen() {
  const { t } = useTranslation();

  return (
    <Screen padded={false}>
      <Header title={t('chat.title')} />
      <EmptyState
        icon={MessagesSquare}
        title={t('chat.emptyTitle')}
        description={t('chat.emptyDesc')}
      />
    </Screen>
  );
}
