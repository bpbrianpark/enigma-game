import { prisma } from "../../lib/prisma";

/*  Gets the daily category for today using a date-based seed. Returns the slug of the daily category. */
export async function getDailyCategory(): Promise<string> {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // Check if already selected today
  const todayCategory = await prisma.category.findFirst({
    where: {
      isDaily: true,
      playedOn: {
        gte: todayUTC,
        lt: new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    select: {
      slug: true,
    },
  });

  if (todayCategory) {
    return todayCategory.slug;
  }

  // If not selected yet, select it
  return await selectDailyCategory();
}

// Extract the selection logic
export async function selectDailyCategory(): Promise<string> {
  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayISO = todayUTC.toISOString().split('T')[0];
  const seed = todayISO;

  // Check if already selected today
  const todayCategory = await prisma.category.findFirst({
    where: {
      isDaily: true,
      playedOn: {
        gte: todayUTC,
        lt: new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    select: { slug: true },
  });

  if (todayCategory) {
    return todayCategory.slug;
  }

  // Find available categories
  const availableCategories = await prisma.category.findMany({
    where: {
      isDaily: true,
      hasBeenSelected: false,
    },
    select: {
      id: true,
      slug: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (availableCategories.length === 0) {
    // Reset all daily categories
    await prisma.category.updateMany({
      where: { isDaily: true },
      data: { hasBeenSelected: false },
    });

    const allDailyCategories = await prisma.category.findMany({
      where: { isDaily: true },
      select: { id: true, slug: true },
      orderBy: { id: 'asc' },
    });

    if (allDailyCategories.length === 0) {
      throw new Error("No daily categories found in database");
    }

    const selectedIndex = hashString(seed) % allDailyCategories.length;
    const selectedCategory = allDailyCategories[selectedIndex];

    await prisma.category.update({
      where: { id: selectedCategory.id },
      data: {
        hasBeenSelected: true,
        playedOn: todayUTC,
      },
    });

    return selectedCategory.slug;
  }

  const selectedIndex = hashString(seed) % availableCategories.length;
  const selectedCategory = availableCategories[selectedIndex];

  await prisma.category.update({
    where: { id: selectedCategory.id },
    data: {
      hasBeenSelected: true,
      playedOn: todayUTC,
    },
  });

  return selectedCategory.slug;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash);
}

