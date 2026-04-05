export interface PaginationItemType extends React.ComponentProps<"div"> {
  isActive?: boolean;
}

export interface PaginationManagementPropsType {
  changePage: (page: number) => void;
  currentPage: number;
  pagesNumber: number;
}

export interface PaginationType {
  currentPage: number;
  records: number;
  totalPages: number;
}
