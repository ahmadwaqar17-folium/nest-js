export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
  route: string,
) {
  const totalPages = Math.ceil(total / limit);
  const nextPage = page < totalPages ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return {
    total,
    page,
    limit,
    totalPages,
    next: nextPage ? `${route}?page=${nextPage}&limit=${limit}` : null,
    prev: prevPage ? `${route}?page=${prevPage}&limit=${limit}` : null,
  };
}
