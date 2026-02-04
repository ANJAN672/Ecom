'use client';

import { useEffect, useState } from 'react';
import { productsApi, categoriesApi } from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';
import { Product, Category } from '@/types';
import Link from 'next/link';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productsApi.getAll({
          categoryId: selectedCategory || undefined,
          limit: 20,
        }),
        categoriesApi.getAll(),
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section - Focus & Clarity */}
      <section className="bg-secondary/30 border-b border-border">
        <div className="container section-spacing flex flex-col items-center text-center">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
              Essential items for <br className="hidden sm:block" />
              your <span className="text-accent underline underline-offset-8 decoration-accent/20">everyday needs</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Carefully curated products for your lifestyle.
              Authentic quality, direct to your doorstep.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <a href="#shop" className="btn-clean btn-primary-clean h-12 px-8 text-base">
                Explore Collection
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop Section - Strict Grid & Filtering */}
      <section id="shop" className="bg-background py-12 md:py-20 lg:py-24">
        <div className="container">
          {/* Filter Bar - Professional Centering */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-border/50 pb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Latest Arrivals'}
              </h2>
              <p className="text-xs text-muted-foreground">Showing {products.length} products total</p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`btn-clean !h-8 !px-4 !text-xs rounded-full border transition-all whitespace-nowrap ${!selectedCategory
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border hover:border-muted'
                  }`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`btn-clean !h-8 !px-4 !text-xs rounded-full border transition-all whitespace-nowrap ${selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-transparent text-muted-foreground border-border hover:border-muted'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout - Technical Alignment */}
          {isLoading ? (
            <div className="grid-standard cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="skeleton aspect-square rounded-lg" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-full rounded" />
                    <div className="skeleton h-6 w-1/4 rounded mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-border rounded-xl bg-secondary/10">
              <div className="w-16 h-16 bg-background rounded-full border border-border flex items-center justify-center mb-6 text-muted-foreground/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground">No products found</h3>
              <p className="text-muted-foreground mt-2 max-w-xs mx-auto">We couldn't find any products in this category at the moment. Please try again later.</p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-8 text-primary font-semibold hover:underline underline-offset-4"
              >
                View all products
              </button>
            </div>
          ) : (
            <div className="grid-standard cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Social Proof / Features */}
      <section className="bg-secondary/30 border-y border-border">
        <div className="container py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: 'M5 13l4 4L19 7', title: 'Quality Assured', desc: 'Every product is hand-picked for quality.' },
              { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Fast Delivery', desc: 'Average shipping time of 2-3 business days.' },
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Secure Payment', desc: 'Your security is our top priority.' },
              { icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z', title: 'Friendly Support', desc: 'Need help? Support is just a chat away.' },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-background rounded-lg border border-border flex items-center justify-center text-accent">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
