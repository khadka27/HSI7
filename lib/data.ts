import fs from 'fs';
import path from 'path';
import type { Category, Subcategory, Product, HeroSettings } from './types';

const dataDir = path.join(process.cwd(), 'data');

function readJSON<T>(filename: string): T[] {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T[];
}

function writeJSON<T>(filename: string, data: T[]): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  categories: {
    getAll: () => readJSON<Category>('categories.json'),
    getById: (id: string) => readJSON<Category>('categories.json').find(c => c.id === id),
    create: (item: Category) => {
      const all = readJSON<Category>('categories.json');
      all.push(item);
      writeJSON('categories.json', all);
      return item;
    },
    update: (id: string, updates: Partial<Category>) => {
      const all = readJSON<Category>('categories.json');
      const idx = all.findIndex(c => c.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates };
      writeJSON('categories.json', all);
      return all[idx];
    },
    delete: (id: string) => {
      const all = readJSON<Category>('categories.json');
      const filtered = all.filter(c => c.id !== id);
      writeJSON('categories.json', filtered);
      return filtered.length < all.length;
    },
  },
  subcategories: {
    getAll: () => readJSON<Subcategory>('subcategories.json'),
    getById: (id: string) => readJSON<Subcategory>('subcategories.json').find(s => s.id === id),
    getBySlug: (slug: string) => readJSON<Subcategory>('subcategories.json').find(s => s.slug === slug),
    getByType: (type: string) => readJSON<Subcategory>('subcategories.json').filter(s => s.categoryType === type),
    create: (item: Subcategory) => {
      const all = readJSON<Subcategory>('subcategories.json');
      all.push(item);
      writeJSON('subcategories.json', all);
      return item;
    },
    update: (id: string, updates: Partial<Subcategory>) => {
      const all = readJSON<Subcategory>('subcategories.json');
      const idx = all.findIndex(s => s.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates };
      writeJSON('subcategories.json', all);
      return all[idx];
    },
    delete: (id: string) => {
      const all = readJSON<Subcategory>('subcategories.json');
      const filtered = all.filter(s => s.id !== id);
      writeJSON('subcategories.json', filtered);
      return filtered.length < all.length;
    },
  },
  products: {
    getAll: () => readJSON<Product>('products.json'),
    getById: (id: string) => readJSON<Product>('products.json').find(p => p.id === id),
    getBySlug: (slug: string) => readJSON<Product>('products.json').find(p => p.slug === slug),
    getByType: (type: string) => readJSON<Product>('products.json').filter(p => p.categoryType === type),
    getBySubcategory: (subcategoryId: string) => readJSON<Product>('products.json').filter(p => p.subcategoryId === subcategoryId),
    create: (item: Product) => {
      const all = readJSON<Product>('products.json');
      all.push(item);
      writeJSON('products.json', all);
      return item;
    },
    update: (id: string, updates: Partial<Product>) => {
      const all = readJSON<Product>('products.json');
      const idx = all.findIndex(p => p.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates };
      writeJSON('products.json', all);
      return all[idx];
    },
    delete: (id: string) => {
      const all = readJSON<Product>('products.json');
      const filtered = all.filter(p => p.id !== id);
      writeJSON('products.json', filtered);
      return filtered.length < all.length;
    },
  },
  heroSettings: {
    get: () => {
      const settings = readJSON<HeroSettings>('hero-settings.json');
      return settings[0] || {
        id: 'hero-1',
        title: 'Your Wellness Journey Starts Here',
        subtitle: 'Premium Health Products',
        description: 'Discover science-backed supplements, premium fitness gear, and organic wellness products curated for your health goals.',
        backgroundImage: '',
        backgroundType: 'gradient' as const,
        gradientFrom: '#16A34A',
        gradientVia: '#15803D',
        gradientTo: '#14532D',
        textColor: '#FFFFFF',
        overlayOpacity: 30,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        updatedAt: new Date().toISOString(),
      };
    },
    update: (updates: Partial<HeroSettings>) => {
      const settings = readJSON<HeroSettings>('hero-settings.json');
      const current = settings[0] || {
        id: 'hero-1',
        title: 'Your Wellness Journey Starts Here',
        subtitle: 'Premium Health Products',
        description: 'Discover science-backed supplements, premium fitness gear, and organic wellness products curated for your health goals.',
        backgroundImage: '',
        backgroundType: 'gradient' as const,
        gradientFrom: '#16A34A',
        gradientVia: '#15803D',
        gradientTo: '#14532D',
        textColor: '#FFFFFF',
        overlayOpacity: 30,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        updatedAt: new Date().toISOString(),
      };
      
      const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
      writeJSON('hero-settings.json', [updated]);
      return updated;
    },
  },
};
