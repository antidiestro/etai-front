export default function appendPeriod(input: string): string {
  const trimmedInput = input.trim();
  if (!trimmedInput.endsWith(".")) {
    return `${trimmedInput}.`;
  }
  return trimmedInput;
}
