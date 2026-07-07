export const formatSizeMb = (size: number) => {
  const mb = size / (1024 * 1024);
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
};

export const prettyDate = (value: string) => {
  const d = new Date(value);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
