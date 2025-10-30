import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import sharp from "sharp";
import rateLimit from "express-rate-limit";
import cors from "cors";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    storeId?: string;
  };
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Ekki innskráður' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Ógildur auðkenningarlykill' });
  }
};

const requireRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Ekki heimild' });
    }
    next();
  };
};

const uploadStorage = multer.memoryStorage();
const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Ógild skráartegund'));
    }
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Of margar tilraunir, reyndu aftur síðar',
});

const viewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Of margar beiðnir',
});

function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cors());
  app.use('/uploads', cors());

  app.post('/api/v1/auth/register-store', authLimiter, async (req, res) => {
    try {
      const { email, password, storeName } = req.body;

      if (!email || !password || !storeName) {
        return res.status(400).json({ message: 'Vantar upplýsingar' });
      }

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: 'Netfang er þegar í notkun' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser(email, passwordHash, 'store');

      const store = await storage.createStore({
        name: storeName,
        description: null,
        logoUrl: null,
        address: null,
        geoLat: null,
        geoLng: null,
        phone: null,
        website: null,
        ownerUserId: user.id,
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, storeId: store.id },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
        store,
        token,
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Villa kom upp' });
    }
  });

  app.post('/api/v1/auth/login', authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Vantar upplýsingar' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Rangt netfang eða lykilorð' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: 'Rangt netfang eða lykilorð' });
      }

      const store = await storage.getStoreByOwnerId(user.id);

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, storeId: store?.id },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
        store: store || undefined,
        token,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Villa kom upp' });
    }
  });

  app.get('/api/v1/stores/:id', async (req, res) => {
    try {
      const store = await storage.getStore(req.params.id);
      if (!store) {
        return res.status(404).json({ message: 'Verslun fannst ekki' });
      }
      res.json(store);
    } catch (error: any) {
      console.error('Get store error:', error);
      res.status(500).json({ message: 'Villa kom upp' });
    }
  });

  app.put('/api/v1/stores/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const store = await storage.getStore(req.params.id);
      if (!store) {
        return res.status(404).json({ message: 'Verslun fannst ekki' });
      }

      if (store.ownerUserId !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Ekki heimild' });
      }

      const updated = await storage.updateStore(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error('Update store error:', error);
      res.status(500).json({ message: 'Villa kom upp' });
    }
  });

  app.get('/api/v1/stores/:id/posts', async (req, res) => {
    try {
      const posts = await storage.getSalePostsWithDetails({
        storeId: req.params.id,
        isActive: req.query.activeOnly === 'true',
      });
      res.json(posts);
    } catch (error: any) {
      console.error('Get store posts error:', error);
      res.status(500).json({ message: 'Villa kom upp' });
    }
  });

  app.get('/api/v1/posts', async (req, res) => {
    try {
      const filters: any = {};

      if (req.query.category) filters.category = req.query.category;
      if (req.query.q) filters.search = req.query.q;
      if (req.query.activeOnly) filters.isActive = req.query.activeOnly === 'true';

      let posts = await storage.getSalePostsWithDetails(filters);

      if (req.query.sort === 'discount') {
        posts = posts.sort((a, b) => b.discountPercent - a.discountPercent);
      } else {
        posts = posts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      res.json(posts);
    } catch (error: any) {
      console.error('Get posts error:', error);
      res.status(500).json({ message: 'Villa kom upp' });
    }
  });

  app.get('/api/v1/posts/:id', async (req, res) => {
    try {
      const post = await storage.getSalePostWithDetails(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Færsla fannst ekki' });
      }
      res.json(post);
    } catch (error: any) {
      console.error('Get post error:', error);
      res.status(500).json({ message: 'Villa kom upp' });
    }
  });

  app.post('/api/v1/posts', authMiddleware, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'store' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Ekki heimild' });
      }

      const store = await storage.getStoreByOwnerId(req.user.id);
      if (!store && req.user.role === 'store') {
        return res.status(404).json({ message: 'Verslun fannst ekki' });
      }

      const { title, description, category, priceOriginal, priceSale, startsAt, endsAt, images } = req.body;

      if (!title || !category || !priceOriginal || !priceSale || !startsAt || !endsAt || !images || images.length === 0) {
        return res.status(400).json({ message: 'Vantar upplýsingar' });
      }

      const post = await storage.createSalePost({
        storeId: store!.id,
        title,
        description: description || null,
        category,
        priceOriginal: parseFloat(priceOriginal),
        priceSale: parseFloat(priceSale),
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        isActive: true,
      });

      await storage.createImages(post.id, images);

      const postWithDetails = await storage.getSalePostWithDetails(post.id);
      res.status(201).json(postWithDetails);
    } catch (error: any) {
      console.error('Create post error:', error);
      res.status(500).json({ message: 'Villa kom upp' });
    }
  });

  app.put('/api/v1/posts/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const post = await storage.getSalePost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Færsla fannst ekki' });
      }

      const store = await storage.getStore(post.storeId);
      if (!store || (store.ownerUserId !== req.user?.id && req.user?.role !== 'admin')) {
        return res.status(403).json({ message: 'Ekki heimild' });
      }

      const { title, description, category, priceOriginal, priceSale, startsAt, endsAt, images } = req.body;

      const updates: any = {};
      if (title) updates.title = title;
      if (description !== undefined) updates.description = description || null;
      if (category) updates.category = category;
      if (priceOriginal) updates.priceOriginal = parseFloat(priceOriginal);
      if (priceSale) updates.priceSale = parseFloat(priceSale);
      if (startsAt) updates.startsAt = new Date(startsAt);
      if (endsAt) updates.endsAt = new Date(endsAt);

      await storage.updateSalePost(req.params.id, updates);

      if (images) {
        await storage.deleteImagesBySalePostId(req.params.id);
        await storage.createImages(req.params.id, images);
      }

      const updated = await storage.getSalePostWithDetails(req.params.id);
      res.json(updated);
    } catch (error: any) {
      console.error('Update post error:', error);
      res.status(500).json({ message: 'Villa kom upp' });
    }
  });

  app.delete('/api/v1/posts/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
      const post = await storage.getSalePost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Færsla fannst ekki' });
      }

      const store = await storage.getStore(post.storeId);
      if (!store || (store.ownerUserId !== req.user?.id && req.user?.role !== 'admin')) {
        return res.status(403).json({ message: 'Ekki heimild' });
      }

      await storage.deleteSalePost(req.params.id);
      res.json({ message: 'Færslu eytt' });
    } catch (error: any) {
      console.error('Delete post error:', error);
      res.status(500).json({ message: 'Villa kom upp' });
    }
  });

  app.post('/api/v1/posts/:id/view', viewLimiter, async (req, res) => {
    try {
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                  req.socket.remoteAddress || 
                  'unknown';
      const ipHash = hashIP(ip);

      await storage.createViewEvent(req.params.id, ipHash);
      res.json({ message: 'Skoðun skráð' });
    } catch (error: any) {
      console.error('View event error:', error);
      res.status(500).json({ message: 'Villa kom upp' });
    }
  });

  app.post('/api/v1/uploads', authMiddleware, upload.single('image'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Engin mynd fannst' });
      }

      const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.webp`;
      const filepath = path.join(UPLOAD_DIR, filename);

      await sharp(req.file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(filepath);

      const url = `/uploads/${filename}`;
      res.json({ url });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Villa kom upp við upphleðslu' });
    }
  });

  app.use('/uploads', express.static(UPLOAD_DIR));

  const httpServer = createServer(app);

  await seedData();

  return httpServer;
}

async function seedData() {
  const existingUsers = await Promise.all([
    storage.getUserByEmail('litabudin@example.is'),
    storage.getUserByEmail('gaedaskor@example.is'),
    storage.getUserByEmail('heima@example.is'),
  ]);

  if (existingUsers.some(u => u)) {
    console.log('Seed data already exists');
    return;
  }

  console.log('Creating seed data...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await storage.createUser('admin@utsalapp.is', adminPassword, 'admin');

  const storeData = [
    {
      email: 'litabudin@example.is',
      password: 'store123',
      storeName: 'LitaBúðin',
      description: 'Falleg og litríkföt fyrir alla fjölskylduna',
      address: 'Laugavegur 45, 101 Reykjavík',
      phone: '581-2345',
      website: 'https://litabudin.is',
    },
    {
      email: 'gaedaskór@example.is',
      password: 'store123',
      storeName: 'GæðaSkór',
      description: 'Vandað skófatnaður fyrir alla',
      address: 'Kringlan 4-12, 103 Reykjavík',
      phone: '568-9876',
      website: 'https://gaedaskor.is',
    },
    {
      email: 'heima@example.is',
      password: 'store123',
      storeName: 'Heima&Heilsa',
      description: 'Húsgögn og heilsuvörur',
      address: 'Smáralind, 201 Kópavogur',
      phone: '554-3210',
      website: 'https://heimaheilsa.is',
    },
  ];

  const stores: any[] = [];
  for (const data of storeData) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await storage.createUser(data.email, passwordHash, 'store');
    const store = await storage.createStore({
      name: data.storeName,
      description: data.description,
      logoUrl: null,
      address: data.address,
      geoLat: null,
      geoLng: null,
      phone: data.phone,
      website: data.website,
      ownerUserId: user.id,
    });
    stores.push(store);
  }

  const posts = [
    {
      storeId: stores[0].id,
      title: 'Sumarútsala - Kjólar',
      description: 'Fallegir sumarkjólar með allt að 50% afslætti. Margir litir og stærðir í boði.',
      category: 'fatnad' as const,
      priceOriginal: 12990,
      priceSale: 6490,
      images: [{ url: '/placeholder-dress.jpg', alt: 'Sumarkjóll' }],
    },
    {
      storeId: stores[0].id,
      title: 'Barnafatnaður - 40% afsláttur',
      description: 'Allur barnafatnaður með 40% afslætti í takmarkaðan tíma.',
      category: 'fatnad' as const,
      priceOriginal: 5990,
      priceSale: 3590,
      images: [{ url: '/placeholder-kids.jpg', alt: 'Barnafatnaður' }],
    },
    {
      storeId: stores[0].id,
      title: 'Úlpur og jakkar',
      description: 'Vetrarvörur á frábæru verði. Hlýir og fallegir.',
      category: 'fatnad' as const,
      priceOriginal: 24990,
      priceSale: 14990,
      images: [{ url: '/placeholder-jacket.jpg', alt: 'Úlpur' }],
    },
    {
      storeId: stores[1].id,
      title: 'Leðurskór - 35% afsláttur',
      description: 'Vandaðir leðurskór fyrir konur og karla. Margir stílar.',
      category: 'fatnad' as const,
      priceOriginal: 19990,
      priceSale: 12990,
      images: [{ url: '/placeholder-shoes.jpg', alt: 'Leðurskór' }],
    },
    {
      storeId: stores[1].id,
      title: 'Íþróttaskór á tilboði',
      description: 'Hlaupaskór og þjálfunarskór frá fremstu framleiðendum.',
      category: 'fatnad' as const,
      priceOriginal: 14990,
      priceSale: 9990,
      images: [{ url: '/placeholder-sneakers.jpg', alt: 'Íþróttaskór' }],
    },
    {
      storeId: stores[2].id,
      title: 'Sófasett - 30% afsláttur',
      description: 'Þægileg 3ja sæta sófasett með hægindastól. Margir litir.',
      category: 'husgogn' as const,
      priceOriginal: 189990,
      priceSale: 132990,
      images: [{ url: '/placeholder-sofa.jpg', alt: 'Sófasett' }],
    },
    {
      storeId: stores[2].id,
      title: 'Matborðssett',
      description: 'Fallegt matborð með 6 stólum. Úr eik.',
      category: 'husgogn' as const,
      priceOriginal: 149990,
      priceSale: 99990,
      images: [{ url: '/placeholder-table.jpg', alt: 'Matborð' }],
    },
    {
      storeId: stores[2].id,
      title: 'Rúm og dýnur',
      description: 'Heilsurúm með dýnu og kodda. Margar stærðir.',
      category: 'husgogn' as const,
      priceOriginal: 129990,
      priceSale: 89990,
      images: [{ url: '/placeholder-bed.jpg', alt: 'Rúm' }],
    },
    {
      storeId: stores[0].id,
      title: 'Peysor og bolir',
      description: 'Vorvörur með 25% afslætti. Mörg munstur.',
      category: 'fatnad' as const,
      priceOriginal: 7990,
      priceSale: 5990,
      images: [{ url: '/placeholder-sweater.jpg', alt: 'Peysa' }],
    },
    {
      storeId: stores[1].id,
      title: 'Sandalar og slipur',
      description: 'Sumarskór á frábæru verði.',
      category: 'fatnad' as const,
      priceOriginal: 8990,
      priceSale: 4990,
      images: [{ url: '/placeholder-sandals.jpg', alt: 'Sandalar' }],
    },
  ];

  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  for (const postData of posts) {
    const post = await storage.createSalePost({
      ...postData,
      startsAt: now,
      endsAt: Math.random() > 0.5 ? weekLater : monthLater,
      isActive: true,
    });

    await storage.createImages(post.id, postData.images);

    const viewCount = Math.floor(Math.random() * 100) + 10;
    for (let i = 0; i < viewCount; i++) {
      await storage.createViewEvent(post.id, `hash-${i}`);
    }
  }

  console.log('Seed data created successfully!');
  console.log('Store accounts:');
  storeData.forEach(s => console.log(`  ${s.email} / ${s.password}`));
  console.log(`Admin account: admin@utsalapp.is / admin123`);
}
