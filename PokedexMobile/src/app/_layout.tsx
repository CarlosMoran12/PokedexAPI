import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
 
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { PokedexStoreProvider } from '@/data/pokedex-store';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <PokedexStoreProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
      </PokedexStoreProvider>
    </ThemeProvider>
  );
}
