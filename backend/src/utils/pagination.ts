import { PaginationParams } from '../types';

export const getPaginationParams = (
  page?: string | number,
  limit?: string | number
): PaginationParams => {
  const pageNum = Math.max(1, parseInt(String(page || 1), 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit || 10), 10)));
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
