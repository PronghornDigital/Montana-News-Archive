export function dPad(s: string): string {
  if (s.length === 1) {
    return '0' + s;
  }
  return s;
}
export function dToS(d: Date): string {
  const month = dPad('' + (d.getMonth() + 1));
  const day = dPad('' + d.getDate());
  return `${d.getFullYear()}-${month}-${day}`;
}

export function sToD(s: string): Date {
  const parts = s.split('-');
  if (parts.length !== 3) {
    return null;
  } else {
    return new Date(
        parseInt(parts[0], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[2], 10)
    );
  }
}

