import prisma from './db';
import type { Category, Subcategory, Product, HeroSettings } from './types';

export const db = {
  categories: {
    getAll: async () => {
      return await prisma.category.findMany({
        include: {
          subcategories: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
    getById: async (id: string) => {
      return await prisma.category.findUnique({
        where: { id },
        include: {
          subcategories: true,
        },
      });
    },
    create: async (item: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await prisma.category.create({
        data: item,
      });
    },
    update: async (id: string, updates: Partial<Category>) => {
      return await prisma.category.update({
        where: { id },
        data: updates,
      });
    },
    delete: async (id: string) => {
      await prisma.category.delete({
        where: { id },
      });
      return true;
    },
  },
  subcategories: {
    getAll: async () => {
      return await prisma.subcategory.findMany({
        include: {
          category: true,
          products: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
    getById: async (id: string) => {
      return await prisma.subcategory.findUnique({
        where: { id },
        include: {
          category: true,
          products: true,
        },
      });
    },
    getBySlug: async (slug: string) => {
      return await prisma.subcategory.findUnique({
        where: { slug },
        include: {
          category: true,
          products: true,
        },
      });
    },
    getByType: async (type: string) => {
      return await prisma.subcategory.findMany({
        where: { categoryType: type as any },
        include: {
          category: true,
          products: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
    create: async (item: Omit<Subcategory, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await prisma.subcategory.create({
        data: item,
      });
    },
    update: async (id: string, updates: Partial<Subcategory>) => {
      return await prisma.subcategory.update({
        where: { id },
        data: updates,
      });
    },
    delete: async (id: string) => {
      await prisma.subcategory.delete({
        where: { id },
      });
      return true;
    },
  },
  products: {
    getAll: async () => {
      return await prisma.product.findMany({
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },
    getById: async (id: string) => {
      return await prisma.product.findUnique({
        where: { id },
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
        },
      });
    },
    getBySlug: async (slug: string) => {
      return await prisma.product.findUnique({
        where: { slug },
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
        },
      });
    },
    getByType: async (type: string) => {
      return await prisma.product.findMany({
        where: { categoryType: type as any },
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },
    getBySubcategory: async (subcategoryId: string) => {
      return await prisma.product.findMany({
        where: { subcategoryId },
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    },
    create: async (item: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await prisma.product.create({
        data: item,
      });
    },
    update: async (id: string, updates: Partial<Product>) => {
      return await prisma.product.update({
        where: { id },
        data: updates,
      });
    },
    delete: async (id: string) => {
      await prisma.product.delete({
        where: { id },
      });
      return true;
    },
  },
  heroSettings: {
    get: async () => {
      const settings = await prisma.heroSettings.findFirst({
        orderBy: { updatedAt: 'desc' },
      });
      
      if (!settings) {
        // Create default hero settings if none exist
        return await prisma.heroSettings.create({
          data: {
            title: 'Your Wellness Journey Starts Here',
            subtitle: 'Premium Health Products',
            description: 'Discover science-backed supplements, premium fitness gear, and organic wellness products curated for your health goals.',
            backgroundImage: '',
            backgroundType: 'GRADIENT',
            gradientFrom: '#16A34A',
            gradientVia: '#15803D',
            gradientTo: '#14532D',
            textColor: '#FFFFFF',
            overlayOpacity: 30,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          },
        });
      }
      
      return settings;
    },
    update: async (updates: Partial<HeroSettings>) => {
      const existing = await prisma.heroSettings.findFirst();
      
      if (existing) {
        return await prisma.heroSettings.update({
          where: { id: existing.id },
          data: updates,
        });
      } else {
        return await prisma.heroSettings.create({
          data: {
            title: 'Your Wellness Journey Starts Here',
            subtitle: 'Premium Health Products',
            description: 'Discover science-backed supplements, premium fitness gear, and organic wellness products curated for your health goals.',
            backgroundImage: '',
            backgroundType: 'GRADIENT',
            gradientFrom: '#16A34A',
            gradientVia: '#15803D',
            gradientTo: '#14532D',
            textColor: '#FFFFFF',
            overlayOpacity: 30,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            ...updates,
          },
        });
      }
    },
  },
};
