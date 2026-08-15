import { corsOrigins } from './cors.config.js';

describe('cors.config', () => {
  const original = process.env.FRONTEND_URL;

  afterEach(() => {
    process.env.FRONTEND_URL = original;
  });

  it('يفسّر الأوريجنات المفصولة بفواصل ويقتطع المسافات', () => {
    process.env.FRONTEND_URL = 'http://a.test, http://b.test, ';
    expect(corsOrigins()).toEqual(['http://a.test', 'http://b.test']);
  });

  it('يرجع افتراضي localhost:3000 عند غياب FRONTEND_URL', () => {
    delete process.env.FRONTEND_URL;
    expect(corsOrigins()).toEqual(['http://localhost:3000']);
  });
});
