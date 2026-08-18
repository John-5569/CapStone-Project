import apiClient from './apiClient';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const buildPagination = (page, limit, total) => {
  const safePage = Math.max(1, Number(page) || DEFAULT_PAGE);
  const safeLimit = Math.max(1, Number(limit) || DEFAULT_LIMIT);
  const safeTotal = Math.max(0, Number(total) || 0);
  const totalPages = Math.max(1, Math.ceil(safeTotal / safeLimit));

  return {
    page: safePage,
    limit: safeLimit,
    total: safeTotal,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrevious: safePage > 1
  };
};

const paginateArray = (items, page, limit) => {
  const pagination = buildPagination(page, limit, items.length);
  const start = (pagination.page - 1) * pagination.limit;
  const end = start + pagination.limit;

  return {
    data: items.slice(start, end),
    pagination
  };
};

const normalizeResponse = (payload, page, limit) => {
  if (Array.isArray(payload)) {
    return paginateArray(payload, page, limit);
  }

  if (payload && Array.isArray(payload.data)) {
    const incoming = payload.pagination || {};
    const pagination = {
      page: incoming.page ?? page,
      limit: incoming.limit ?? limit,
      total: incoming.total ?? payload.data.length,
      totalPages: incoming.totalPages,
      hasNext: incoming.hasNext,
      hasPrevious: incoming.hasPrevious
    };

    const normalizedPagination = buildPagination(
      pagination.page,
      pagination.limit,
      pagination.total
    );

    return {
      data: payload.data,
      pagination: {
        ...normalizedPagination,
        totalPages: Number(pagination.totalPages) || normalizedPagination.totalPages,
        hasNext: typeof pagination.hasNext === 'boolean' ? pagination.hasNext : normalizedPagination.hasNext,
        hasPrevious: typeof pagination.hasPrevious === 'boolean' ? pagination.hasPrevious : normalizedPagination.hasPrevious
      }
    };
  }

  return paginateArray([], page, limit);
};

export const datasetService = {
  async getDatasets(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    const response = await apiClient.get('/user/datasets', {
      params: { page, limit }
    });
    return normalizeResponse(response.data, page, limit);
  }
};
