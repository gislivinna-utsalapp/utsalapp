import {
  type User,
  type Store,
  type SalePost,
  type Image,
  type ViewEvent,
  type Favorite,
  type SalePostWithDetails,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(email: string, passwordHash: string, role: "store" | "admin"): Promise<User>;

  getStore(id: string): Promise<Store | undefined>;
  getStoreByOwnerId(ownerId: string): Promise<Store | undefined>;
  createStore(store: Omit<Store, 'id' | 'createdAt'>): Promise<Store>;
  updateStore(id: string, updates: Partial<Store>): Promise<Store | undefined>;

  getSalePost(id: string): Promise<SalePost | undefined>;
  getSalePosts(filters?: {
    storeId?: string;
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<SalePost[]>;
  createSalePost(post: Omit<SalePost, 'id' | 'createdAt'>): Promise<SalePost>;
  updateSalePost(id: string, updates: Partial<SalePost>): Promise<SalePost | undefined>;
  deleteSalePost(id: string): Promise<boolean>;

  getImages(salePostId: string): Promise<Image[]>;
  createImages(salePostId: string, images: Array<{ url: string; alt?: string }>): Promise<Image[]>;
  deleteImagesBySalePostId(salePostId: string): Promise<void>;

  createViewEvent(salePostId: string, ipHash?: string): Promise<ViewEvent>;
  getViewCount(salePostId: string): Promise<number>;

  getSalePostWithDetails(id: string): Promise<SalePostWithDetails | undefined>;
  getSalePostsWithDetails(filters?: {
    storeId?: string;
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<SalePostWithDetails[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private stores: Map<string, Store> = new Map();
  private salePosts: Map<string, SalePost> = new Map();
  private images: Map<string, Image> = new Map();
  private viewEvents: Map<string, ViewEvent> = new Map();
  private favorites: Map<string, Favorite> = new Map();

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(email: string, passwordHash: string, role: "store" | "admin"): Promise<User> {
    const user: User = {
      id: randomUUID(),
      email,
      passwordHash,
      role,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getStore(id: string): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getStoreByOwnerId(ownerId: string): Promise<Store | undefined> {
    return Array.from(this.stores.values()).find(s => s.ownerUserId === ownerId);
  }

  async createStore(storeData: Omit<Store, 'id' | 'createdAt'>): Promise<Store> {
    const store: Store = {
      ...storeData,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.stores.set(store.id, store);
    return store;
  }

  async updateStore(id: string, updates: Partial<Store>): Promise<Store | undefined> {
    const store = this.stores.get(id);
    if (!store) return undefined;
    const updated = { ...store, ...updates };
    this.stores.set(id, updated);
    return updated;
  }

  async getSalePost(id: string): Promise<SalePost | undefined> {
    return this.salePosts.get(id);
  }

  async getSalePosts(filters?: {
    storeId?: string;
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<SalePost[]> {
    let posts = Array.from(this.salePosts.values());

    if (filters?.storeId) {
      posts = posts.filter(p => p.storeId === filters.storeId);
    }
    if (filters?.category) {
      posts = posts.filter(p => p.category === filters.category);
    }
    if (filters?.isActive !== undefined) {
      const now = new Date();
      posts = posts.filter(p => {
        if (!filters.isActive) return true;
        return p.isActive && new Date(p.startsAt) <= now && new Date(p.endsAt) >= now;
      });
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }

    return posts;
  }

  async createSalePost(postData: Omit<SalePost, 'id' | 'createdAt'>): Promise<SalePost> {
    const post: SalePost = {
      ...postData,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.salePosts.set(post.id, post);
    return post;
  }

  async updateSalePost(id: string, updates: Partial<SalePost>): Promise<SalePost | undefined> {
    const post = this.salePosts.get(id);
    if (!post) return undefined;
    const updated = { ...post, ...updates };
    this.salePosts.set(id, updated);
    return updated;
  }

  async deleteSalePost(id: string): Promise<boolean> {
    await this.deleteImagesBySalePostId(id);
    return this.salePosts.delete(id);
  }

  async getImages(salePostId: string): Promise<Image[]> {
    return Array.from(this.images.values()).filter(i => i.salePostId === salePostId);
  }

  async createImages(salePostId: string, imageData: Array<{ url: string; alt?: string }>): Promise<Image[]> {
    const images: Image[] = imageData.map(data => ({
      id: randomUUID(),
      salePostId,
      url: data.url,
      alt: data.alt || null,
    }));
    images.forEach(img => this.images.set(img.id, img));
    return images;
  }

  async deleteImagesBySalePostId(salePostId: string): Promise<void> {
    const imagesToDelete = Array.from(this.images.values()).filter(i => i.salePostId === salePostId);
    imagesToDelete.forEach(img => this.images.delete(img.id));
  }

  async createViewEvent(salePostId: string, ipHash?: string): Promise<ViewEvent> {
    const event: ViewEvent = {
      id: randomUUID(),
      salePostId,
      viewedAt: new Date(),
      ipHash: ipHash || null,
    };
    this.viewEvents.set(event.id, event);
    return event;
  }

  async getViewCount(salePostId: string): Promise<number> {
    return Array.from(this.viewEvents.values()).filter(v => v.salePostId === salePostId).length;
  }

  async getSalePostWithDetails(id: string): Promise<SalePostWithDetails | undefined> {
    const post = this.salePosts.get(id);
    if (!post) return undefined;

    const store = this.stores.get(post.storeId);
    if (!store) return undefined;

    const images = await this.getImages(post.id);
    const viewCount = await this.getViewCount(post.id);
    const discountPercent = Math.round((1 - post.priceSale / post.priceOriginal) * 100);

    return {
      ...post,
      store,
      images,
      viewCount,
      discountPercent,
    };
  }

  async getSalePostsWithDetails(filters?: {
    storeId?: string;
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<SalePostWithDetails[]> {
    const posts = await this.getSalePosts(filters);
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const store = this.stores.get(post.storeId);
        if (!store) return null;

        const images = await this.getImages(post.id);
        const viewCount = await this.getViewCount(post.id);
        const discountPercent = Math.round((1 - post.priceSale / post.priceOriginal) * 100);

        return {
          ...post,
          store,
          images,
          viewCount,
          discountPercent,
        };
      })
    );

    return postsWithDetails.filter((p): p is SalePostWithDetails => p !== null);
  }
}

export const storage = new MemStorage();
