import { getUserId } from '../auth/get-user-id';
import { LaunchDarklyProvider } from './LaunchDarklyProvider';
import { getAllFlags } from './server';

export async function LaunchDarklyBridge({ children }: { children: React.ReactNode }) {
  const userId = await getUserId();
  const flagsBootstrap = await getAllFlags();

  return (
    <LaunchDarklyProvider flagsBootstrap={flagsBootstrap} userId={userId}>
      {children}
    </LaunchDarklyProvider>
  );
}
