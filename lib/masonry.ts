// Algorithme de la grille « masonry » : colonne la plus courte d'abord.
// Module pur (aucun accès au navigateur) : il sert à la fois au rendu serveur
// et au calcul exact dans le navigateur, avec les mêmes règles.

/** Proportion supposée tant que la vraie proportion d'un élément n'est pas connue. */
export const DEFAULT_RATIO = 16 / 9;

/** Nombre de colonnes selon la largeur du conteneur (px). */
export function columnCount(cw: number): number {
  return cw >= 1280 ? 4 : cw >= 768 ? 3 : 2;
}

/** Largeur d'une colonne (px, arrondie à l'entier inférieur). */
export function columnWidth(cw: number, cols: number, gap: number): number {
  return Math.max(1, Math.floor((cw - gap * (cols - 1)) / cols));
}

export type PxLayout = {
  cols: number;
  colW: number;
  /** Colonne, position et hauteur (px) de chaque élément, dans l'ordre d'entrée. */
  tiles: { col: number; left: number; top: number; height: number }[];
  /** Hauteur de la colonne la plus haute. */
  height: number;
};

/** Placement exact en pixels pour une largeur de conteneur donnée. */
export function layoutPx(ratios: readonly number[], cw: number, gap: number): PxLayout {
  const cols = columnCount(cw);
  const colW = columnWidth(cw, cols, gap);
  const heights = new Array<number>(cols).fill(0);
  const tiles: PxLayout['tiles'] = [];
  for (const r of ratios) {
    const h = Math.max(1, Math.round(colW / r));
    let min = 0;
    for (let i = 1; i < cols; i++) if (heights[i] < heights[min]) min = i;
    tiles.push({ col: min, left: min * (colW + gap), top: heights[min], height: h });
    heights[min] += h + gap;
  }
  const height = Math.max(0, ...heights.map((v) => (v > 0 ? v - gap : 0)));
  return { cols, colW, tiles, height };
}

/** Un placement distinct (colonnes de chaque élément) et les largeurs de conteneur où il s'applique. */
export type Variant = {
  cols: number;
  /** Colonne de chaque élément. */
  col: number[];
  /** Pour chaque élément : somme des 1/proportion des éléments au-dessus, dans sa colonne. */
  above: number[];
  /** Pour chaque élément : nombre d'éléments au-dessus, dans sa colonne. */
  count: number[];
  /** Pour chaque colonne : somme des 1/proportion et nombre d'éléments. */
  totals: { sum: number; count: number }[];
  /** Intervalles [début, fin[ de largeurs de conteneur (px) ; le dernier est ouvert vers l'infini. */
  ranges: [number, number][];
};

const SWEEP_MIN = 200;
const SWEEP_MAX = 4000;

/**
 * Calcule le placement exact (celui du navigateur) pour toutes les largeurs de
 * conteneur de 200 à 4000 px, et regroupe les largeurs qui donnent le même
 * placement. Permet de rendre la grille côté serveur sans connaître la largeur.
 */
export function computeVariants(ratios: readonly number[], gap: number): Variant[] {
  const variants: Variant[] = [];
  const bySignature = new Map<string, Variant>();
  let current: Variant | null = null;
  let start = 0;

  for (let cw = SWEEP_MIN; cw <= SWEEP_MAX; cw++) {
    const layout = layoutPx(ratios, cw, gap);
    const col = layout.tiles.map((t) => t.col);
    const signature = `${layout.cols}:${col.join('')}`;
    let variant = bySignature.get(signature);
    if (!variant) {
      const sums = new Array<number>(layout.cols).fill(0);
      const counts = new Array<number>(layout.cols).fill(0);
      const above: number[] = [];
      const count: number[] = [];
      col.forEach((c, i) => {
        above.push(sums[c]);
        count.push(counts[c]);
        sums[c] += 1 / ratios[i];
        counts[c] += 1;
      });
      variant = {
        cols: layout.cols,
        col,
        above,
        count,
        totals: sums.map((sum, c) => ({ sum, count: counts[c] })),
        ranges: [],
      };
      bySignature.set(signature, variant);
      variants.push(variant);
    }
    if (variant !== current) {
      if (current) current.ranges.push([start, cw]);
      current = variant;
      start = cw === SWEEP_MIN ? 0 : cw;
    }
  }
  if (current) current.ranges.push([start, Infinity]);
  return variants;
}

const num = (n: number) => String(Math.round(n * 1e5) / 1e5);

/** Variables CSS d'un élément : une triplet (colonne, somme, nombre) par placement. */
export function tileVars(variants: readonly Variant[], index: number): Record<string, string> {
  const vars: Record<string, string> = {};
  variants.forEach((v, k) => {
    vars[`--c${k}`] = String(v.col[index]);
    vars[`--s${k}`] = num(v.above[index]);
    vars[`--n${k}`] = String(v.count[index]);
  });
  return vars;
}

/**
 * Feuille de style qui choisit, selon la largeur du conteneur (requêtes de
 * conteneur), la colonne et la position de chaque élément. `scope` est la
 * classe du conteneur (`container-type: inline-size`).
 */
export function variantsCss(scope: string, variants: readonly Variant[], gap: number): string {
  const g = `${gap}px`;
  return variants
    .map((v, k) => {
      const query = v.ranges
        .map(([a, b]) =>
          b === Infinity ? `(width >= ${a}px)` : a === 0 ? `(width < ${b}px)` : `(${a}px <= width < ${b}px)`
        )
        .join(' or ');
      const colw = `(100cqw - ${(v.cols - 1) * gap}px) / ${v.cols}`;
      const heights = v.totals
        .map((t) => `calc(var(--colw) * ${num(t.sum)} + ${Math.max(0, t.count - 1) * gap}px)`)
        .join(',');
      return (
        `@container ${query}{` +
        `.${scope} .mg-box{--colw:calc(${colw});height:max(${heights})}` +
        `.${scope} .mg-t{left:calc(var(--c${k}) * (var(--colw) + ${g}));` +
        `top:calc(var(--s${k}) * var(--colw) + var(--n${k}) * ${g})}}`
      );
    })
    .join('');
}
