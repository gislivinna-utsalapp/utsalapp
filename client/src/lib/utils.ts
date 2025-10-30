import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('is-IS', {
    style: 'currency',
    currency: 'ISK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('is-IS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('is-IS', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function calculateDiscount(original: number, sale: number): number {
  return Math.round((1 - sale / original) * 100);
}

export function isPostActive(startsAt: Date | string, endsAt: Date | string): boolean {
  const now = new Date();
  const start = typeof startsAt === 'string' ? new Date(startsAt) : startsAt;
  const end = typeof endsAt === 'string' ? new Date(endsAt) : endsAt;
  return now >= start && now <= end;
}

export function getTimeRemaining(endsAt: Date | string): string {
  const end = typeof endsAt === 'string' ? new Date(endsAt) : endsAt;
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff < 0) return 'Lokið';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} dagar eftir`;
  if (hours > 0) return `${hours} klst eftir`;
  return 'Lýkur fljótlega';
}
