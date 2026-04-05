export interface PaginationType {
  records: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginationItemType extends React.ComponentProps<"div"> {
  isActive?: boolean;
}

export interface PaginationManagementPropsType {
  changePage: (page: number) => void;
  currentPage: number;
  pagesNumber: number;
}

export interface HeroSectionImagesInResponse {
  computerImage: string;
  mobileImage: string;
  redirectUrl: string;
}

export interface HeroSectionImages {
  computerImage: string;
  mobileImage: string;
  link: string;
}

export type SeoMetaContentType = {
  title: string;
  description: string;
  keywords: string[];
};

export type SeoMetaContentTypeInResponse = {
  title: string;
  description: string;
  tags: string[];
};

export interface LandingPageContentInResponseType {
  id: string;
  name: string;
  images: Array<HeroSectionImagesInResponse>;
  sections: Array<{ title: string; description: string; id: string }>;
  metaContent: SeoMetaContentTypeInResponse;
}

export interface LandingPageContent {
  id: string;
  name: string;
  images: Array<HeroSectionImages>;
  sections: Array<{ title: string; description: string; id: string }>;
  metaContent: SeoMetaContentType | null;
}
export type TranslateFunction = (key: string, options?: Record<string, string | number>) => string;

export type Currency = "EUR" | "USD" | "LYD";

export interface ErrorDataResponse {
  message: string;
  code: string;
}
