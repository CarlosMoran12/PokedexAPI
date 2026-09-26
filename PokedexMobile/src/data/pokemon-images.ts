const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// Display-only resolution: never replace API/form data or request species metadata.
export function pokemonImageSources(number: number, current?: string | null): string[] {
  const valid = Number.isInteger(number) && number > 0;
  const stored = current?.trim();
  const sprite = valid ? `${SPRITES}/${number}.png` : undefined;
  const artwork = valid ? `${SPRITES}/other/official-artwork/${number}.png` : undefined;
  const home = valid ? `${SPRITES}/other/home/${number}.png` : undefined;
  const storedIsSprite = stored ? /sprites\/pokemon\/(?!other\/)|sprites\/versions\//i.test(stored) : false;
  return [...new Set([artwork, storedIsSprite ? undefined : stored, home, storedIsSprite ? stored : undefined, sprite].filter((url): url is string => Boolean(url)))];
}
