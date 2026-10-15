/** One edit to a list of `{ id }` records. The same four ops serve sections, entries and links. */
export type ListOp<T extends { id: string }> =
  | { op: 'add'; item: T }
  | { op: 'update'; id: string; patch: Partial<Omit<T, 'id'>> }
  | { op: 'remove'; id: string }
  | { op: 'move'; id: string; delta: -1 | 1 }

/** Applies `op` and returns a new list. Unknown ids and out-of-range moves return `list` unchanged. */
export function applyListOp<T extends { id: string }>(list: readonly T[], op: ListOp<T>): T[] {
  switch (op.op) {
    case 'add':
      return [...list, op.item]
    case 'update':
      return list.map((item) => (item.id === op.id ? { ...item, ...op.patch } : item))
    case 'remove':
      return list.filter((item) => item.id !== op.id)
    case 'move': {
      const from = list.findIndex((item) => item.id === op.id)
      const to = from + op.delta
      if (from === -1 || to < 0 || to >= list.length) return [...list]
      const next = [...list]
      ;[next[from], next[to]] = [next[to]!, next[from]!]
      return next
    }
  }
}
