// Display only: edited values are serialized into JSX, never evaluated.
export function exampleSource(implementation, args) {
  return `${implementation.trim()}\n\nexport default function Playground() {\n  return <Example {...${JSON.stringify(args, null, 2)}} />;\n}\n`;
}
