// Product, category and review domain types.
import type { ID, IsoDateString, Money, SortDirection } from './common.types';

// Product category.
export interface Category {
  // Unique category identifier.
  id: ID;
  // Category display name.
  name: string;
  // URL-friendly slug.
  slug: string;
  // Optional category image URL.
  imageUrl?: string;
  // Optional icon identifier.
  icon?: string;
  // Number of products within the category.
  productCount: number;
  // Optional parent category identifier for nested taxonomies.
  parentId?: ID;
}

// Product image with metadata.
export interface ProductImage {
  // Unique image identifier.
  id: ID;
  // Image source URL.
  url: string;
  // Accessibility alt text.
  alt?: string;
}

// Product variant such as size or color.
export interface ProductVariant {
  // Unique variant identifier.
  id: ID;
  // Variant name (e.g. "Large / Blue").
  name: string;
  // Optional price override for this variant.
  price?: Money;
  // Units available in stock for this variant.
  stock: number;
  // Optional attribute map (e.g. { color: "Blue" }).
  attributes?: Record<string, string>;
}

// Full product entity.
export interface Product {
  // Unique product identifier.
  id: ID;
  // Product title.
  title: string;
  // URL-friendly slug.
  slug: string;
  // Full product description.
  description: string;
  // Current selling price.
  price: Money;
  // Original price before discount, when discounted.
  compareAtPrice?: Money;
  // Discount percentage (0-100), when discounted.
  discountPercentage?: number;
  // Currency ISO code.
  currency: string;
  // Ordered list of product images.
  images: ProductImage[];
  // Owning category identifier.
  categoryId: ID;
  // Brand name.
  brand?: string;
  // Average rating (0-5).
  rating: number;
  // Total number of ratings.
  ratingCount: number;
  // Units currently in stock.
  stock: number;
  // Whether the product is currently in stock.
  inStock: boolean;
  // Optional variants.
  variants?: ProductVariant[];
  // Marketing tags.
  tags?: string[];
  // Whether the product is featured.
  isFeatured: boolean;
  // Creation timestamp.
  createdAt: IsoDateString;
}

// Product review authored by a customer.
export interface ProductReview {
  // Unique review identifier.
  id: ID;
  // Reviewing user's display name.
  authorName: string;
  // Optional avatar URL of the author.
  authorAvatarUrl?: string;
  // Star rating (1-5).
  rating: number;
  // Optional review title.
  title?: string;
  // Review body text.
  comment: string;
  // Whether the reviewer is a verified buyer.
  isVerifiedPurchase: boolean;
  // Review timestamp.
  createdAt: IsoDateString;
}

// Sortable fields for product list queries.
export type ProductSortField = 'relevance' | 'price' | 'rating' | 'newest';

// Query parameters for fetching a product list.
export interface ProductQueryParams {
  // Page number (1-based).
  page?: number;
  // Items per page.
  pageSize?: number;
  // Filter by category identifier.
  categoryId?: ID;
  // Free-text search query.
  search?: string;
  // Field to sort by.
  sortBy?: ProductSortField;
  // Sort direction.
  sortDirection?: SortDirection;
  // Minimum price filter.
  minPrice?: Money;
  // Maximum price filter.
  maxPrice?: Money;
  // Minimum rating filter.
  minRating?: number;
  // Filter to only in-stock products.
  inStockOnly?: boolean;
}
