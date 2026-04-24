import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SVGShape from './SVGShape';

describe('SVGShape — bounding box', () => {
  it('kare: s x s bounding box', () => {
    const { container } = render(<SVGShape type="kare" size={60} />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('60');
    expect(svg.getAttribute('height')).toBe('60');
  });

  it('cember: s x s bounding box', () => {
    const { container } = render(<SVGShape type="cember" size={50} />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('50');
    expect(svg.getAttribute('height')).toBe('50');
  });

  it('dikdortgen: s x s bounding box (artık s*1.5 değil)', () => {
    const { container } = render(<SVGShape type="dikdortgen" size={60} />);
    const svg = container.querySelector('svg');
    expect(svg.getAttribute('width')).toBe('60');
    expect(svg.getAttribute('height')).toBe('60');
  });

  it('dikdortgen scaleX=1.35: iç rect kutuyu taşmaz', () => {
    const { container } = render(<SVGShape type="dikdortgen" size={60} scaleX={1.35} />);
    const rect = container.querySelector('rect');
    const w = parseFloat(rect.getAttribute('width'));
    // s - m*2 = 60 - 10 = 50 → max width
    expect(w).toBeLessThanOrEqual(50);
  });

  it('ucgen: polygon 3 nokta oluşturur', () => {
    const { container } = render(<SVGShape type="ucgen" size={60} />);
    const poly = container.querySelector('polygon');
    const pts = poly.getAttribute('points').trim().split(/\s+/);
    expect(pts).toHaveLength(3);
  });

  it('geçersiz type: null döner', () => {
    const { container } = render(<SVGShape type="garipbirsey" size={60} />);
    expect(container.querySelector('svg')).toBeNull();
  });
});
