// Course covers are seeded as tokens (t-1…t-4) matching the design mockup.
// Map each to its CSS gradient so cards render without per-course images.
const GRADIENTS: Record<string, string> = {
  't-1': 'linear-gradient(135deg,#46B96A,#1E7A40)',
  't-2': 'linear-gradient(135deg,#F5A623,#C97208)',
  't-3': 'linear-gradient(135deg,#9C5FD4,#5F2DA0)',
  't-4': 'linear-gradient(135deg,#3E9DBF,#1E6480)',
};

const FALLBACK = GRADIENTS['t-1'];

export function coverGradient(token: string): string {
  return GRADIENTS[token] ?? FALLBACK;
}
