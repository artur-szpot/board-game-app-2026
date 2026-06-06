import { PaginationDto } from '../dto/in/pagination.dto';
import { Pagination } from '../pagination';

export const paginationMapper = {
  fromDto: (dto: PaginationDto): Pagination | undefined => {
    const { pageNumber, pageSize } = dto;
    if (pageNumber === undefined || !pageSize) {
      return undefined;
    }
    return { pageNumber, pageSize };
  },
};
