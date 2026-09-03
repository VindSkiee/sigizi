export interface MarketPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface MarketPaginatedResponse<T> {
  data: T;
  meta: MarketPaginationMeta;
}

export function buildMarketPaginatedResponse<T>(
  data: T,
  total: number,
  page: number,
  limit: number,
): MarketPaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
