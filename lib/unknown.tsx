// lib/unknown.tsx
type Blok = {
  component?: string;
  _uid?: string;
  [key: string]: unknown;
};

export default function Unknown({ blok }: { blok?: Blok }) {
  const name = typeof blok?.component === "string" ? blok.component : "unknown";
  return (
    <pre className="text-xs text-red-700 bg-red-50 p-3 rounded">
      Unknown component: {name}
    </pre>
  );
}
