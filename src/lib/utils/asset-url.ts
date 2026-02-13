export function assetUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || '/checkout'}${path}`;
}
