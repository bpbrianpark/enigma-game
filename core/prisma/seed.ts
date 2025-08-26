import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const password = await hash('test', 12)
    const user = await prisma.user.upsert({
        where: { email: 'test@test.com '},
        update: {},
        create: {
            email: 'test@test.com',
            name: 'Test User',
            password
        }
    })
    console.log({ user })

    const categories = [
        {
            slug: "humans-women",
            name: "Women",
            sparql: "SELECT DISTINCT ?item ?item_label WHERE { ?item wdt:P31 wd:Q5; wdt:P21 wd:Q6581072; rdfs:label ?item_label; FILTER(LANG(?item_label) = 'en')} LIMIT 5",
            difficulties: [
                { level: 1, limit: 10 },
                { level: 2, limit: 20 },
                { level: 3, limit: 30 }
            ]
        },
        {
            slug: "pokemon_gen1",
            name: "Pokemon (Generation 1)",
            sparql: "SELECT DISTINCT ?item ?item_label ?itemLabel WHERE { ?item rdfs:label ?item_label. FILTER(LANG(?item_label) = 'en') ?item wdt:P361 wd:Q857976. MINUS { ?item wdt:P31 wd:Q117038109. }}",
            difficulties: [
                { level: 1, limit: 10 },
                { level: 2, limit: 50 },
                { level: 3, limit: 151 }
            ]
        }
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
                slug: cat.slug,
                name: cat.name,
                sparql: cat.sparql,
                difficulties: {
                    create: cat.difficulties.map(d => ({
                        level: d.level,
                        limit: d.limit
                    }))
                }
            }
        });
    }
}
main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })