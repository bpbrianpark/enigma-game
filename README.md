# enigma-game

next-auth
prisma
bcrypt
zod

npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/updateCategories.ts