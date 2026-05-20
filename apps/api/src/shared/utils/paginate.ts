export interface PaginationParams {
  limit: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Genera un resultado paginado basado en cursor.
 * Asume que los items vienen ordenados y tienen un campo `id`.
 */
export function paginate<T extends { id: string }>(
  items: T[],
  limit: number,
): PaginatedResult<T> {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

  return { data, nextCursor, hasMore };
}

/**
 * Construye la cláusula `cursor` de Prisma para paginación basada en ID.
 */
export function buildCursorClause(cursor?: string): { cursor: { id: string }; skip: number } | Record<string, never> {
  if (!cursor) return {};
  return {
    cursor: { id: cursor },
    skip: 1,
  };
}
