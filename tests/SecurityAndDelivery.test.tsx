import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { DeliveryService } from '../src/services/delivery/delivery.service';

describe('Security & Digital Delivery Boundary Safeguards', () => {
  it('ensures public static assets directory contains NO private digital product files', () => {
    const publicDir = path.resolve(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir);

    // Private extension blacklist
    const forbiddenExtensions = ['.zip', '.tar.gz', '.pdf', '.fig', '.blend', '.docx', '.epub', '.flac'];

    const leakedFiles = files.filter((file) =>
      forbiddenExtensions.some((ext) => file.toLowerCase().endsWith(ext))
    );

    expect(leakedFiles).toEqual([]);
  });

  it('verifies DeliveryService marks protected delivery as not configured', () => {
    const expectation = DeliveryService.getDeliveryExpectation();
    expect(expectation.isConfigured).toBe(false);
    expect(expectation.statusMessage).toContain('Protected digital delivery is not yet configured');
  });

  it('rejects generateDownloadUrl to prevent unauthorized file generation', async () => {
    await expect(
      DeliveryService.generateDownloadUrl('order-123', 'de-prod-001')
    ).rejects.toThrow(/DeliveryNotConfiguredError/i);
  });

  it('verifies robots.txt disallows private download and API routes', () => {
    const robotsPath = path.resolve(process.cwd(), 'public/robots.txt');
    expect(fs.existsSync(robotsPath)).toBe(true);

    const content = fs.readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('Disallow: /downloads/private/');
    expect(content).toContain('Disallow: /checkout/');
    expect(content).toContain('Disallow: /api/');
    expect(content).toContain('Sitemap: /sitemap.xml');
  });

  it('verifies .env.example contains only non-secret placeholders', () => {
    const envExamplePath = path.resolve(process.cwd(), '.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);

    const content = fs.readFileSync(envExamplePath, 'utf-8');
    // Ensure no real API secret key patterns
    expect(content).not.toMatch(/sk_live_[0-9a-zA-Z]+/);
    expect(content).not.toMatch(/rzp_live_[0-9a-zA-Z]+/);
    expect(content).toContain('placeholder');
  });

  it('verifies .gitignore contains secrets and private storage directories', () => {
    const gitignorePath = path.resolve(process.cwd(), '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const content = fs.readFileSync(gitignorePath, 'utf-8');
    expect(content).toContain('.env');
    expect(content).toContain('private/');
    expect(content).toContain('node_modules/');
  });
});
