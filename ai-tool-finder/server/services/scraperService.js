import axios from 'axios';
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';

const normalize = (name, description, website, category = 'general') => ({
  name,
  description,
  website,
  category,
  tags: category.split(' '),
  pricing: 'freemium',
  rating: 4,
});

const scrapeFuturepedia = async () => {
  const { data } = await axios.get('https://www.futurepedia.io/');
  const $ = cheerio.load(data);
  const results = [];

  $('a[href*="/tool/"]').slice(0, 25).each((_idx, element) => {
    const name = $(element).text().trim();
    const href = $(element).attr('href');
    if (!name || !href) return;

    results.push(normalize(name, `AI tool discovered from Futurepedia: ${name}`, href.startsWith('http') ? href : `https://www.futurepedia.io${href}`));
  });

  return results;
};

const scrapeProductHunt = async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.goto('https://www.producthunt.com/topics/artificial-intelligence', { waitUntil: 'domcontentloaded' });

    const tools = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[data-test="post-name"]')).slice(0, 20).map((item) => ({
        name: item.textContent?.trim(),
        website: item.href,
      }));
    });

    return tools.filter((item) => item.name && item.website).map((item) => normalize(item.name, `${item.name} listed on Product Hunt`, item.website));
  } finally {
    await browser.close();
  }
};

export const scrapeTools = async () => {
  const sources = await Promise.allSettled([scrapeFuturepedia(), scrapeProductHunt()]);
  return sources.flatMap((source) => (source.status === 'fulfilled' ? source.value : []));
};
