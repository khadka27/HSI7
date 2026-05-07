export type CategoryType = 'nutra' | 'ecom';
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description: string;
  image: string;
  createdAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryType: CategoryType;
  description: string;
  image: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  categoryType: CategoryType;
  subcategoryId: string;
  shortDescription: string;
  detailedDescription: string;
  metaTitle: string;
  metaDescription: string;
  image: string;
  featuredImage: string;
  readMoreLink: string;
  createdAt: string;
}

export interface HeroSettings {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  backgroundType: 'gradient' | 'image';
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  textColor: string;
  overlayOpacity: number;
  backgroundPosition: string;
  backgroundSize: string;
  updatedAt: string;
}
