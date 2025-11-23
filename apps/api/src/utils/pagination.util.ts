interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate<T>(
  data: T[],
  options: PaginationOptions,
): PaginatedResult<T> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50; // Default limit to 50

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedData = data.slice(startIndex, endIndex);
  const total = data.length;
  const totalPages = Math.ceil(total / limit);

  return {
    data: paginatedData,
    total,
    page,
    limit,
    totalPages,
  };
}
