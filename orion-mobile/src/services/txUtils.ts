import { Transaction } from './api';

export function getTxVisual(tx: Pick<Transaction, 'type' | 'category_name'>) {
  const cat = (tx.category_name || '').toLowerCase();
  if (tx.type === 'income')
    return { icon: 'briefcase-outline' as const, iconBg: '#D1FAE5', iconColor: '#10B981' };
  if (cat.includes('comida') || cat.includes('rest'))
    return { icon: 'restaurant-outline' as const, iconBg: '#FEF3C7', iconColor: '#F59E0B' };
  if (cat.includes('transport'))
    return { icon: 'bus-outline' as const, iconBg: '#EFF6FF', iconColor: '#3B82F6' };
  if (cat.includes('salud') || cat.includes('médic'))
    return { icon: 'medkit-outline' as const, iconBg: '#FEE2E2', iconColor: '#EF4444' };
  if (cat.includes('inver') || cat.includes('divid'))
    return { icon: 'trending-up-outline' as const, iconBg: '#D1FAE5', iconColor: '#10B981' };
  if (cat.includes('hogar') || cat.includes('alquil'))
    return { icon: 'home-outline' as const, iconBg: '#EFF6FF', iconColor: '#3B82F6' };
  return { icon: 'card-outline' as const, iconBg: '#F0F4F8', iconColor: '#64748B' };
}

export function formatMoney(amount: number | string): string {
  return Math.abs(Number(amount)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatTxAmount(amount: number | string): string {
  const num = Number(amount);
  return num < 0 ? `-$${formatMoney(num)}` : `+$${formatMoney(num)}`;
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getWeekDays(): { dow: string; day: number; date: Date }[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const dows = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE'];
  return dows.map((dow, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { dow, day: d.getDate(), date: d };
  });
}

export function toDateParam(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
