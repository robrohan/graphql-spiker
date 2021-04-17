
export function log(...v): void {
  console.log(new Date().getTime(), ...v);
}
