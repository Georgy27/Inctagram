import { PrismaClient } from '@prisma/client';

import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seed() {
  await prisma.price.deleteMany();

  await prisma.$transaction(async (tx) => {
    await tx.price.createMany({
      data: [
        {
          period: 1,
          value: 10.0,
          currency: 'USD',
        },
        {
          period: 6,
          value: 50.0,
          currency: 'USD',
        },
        {
          period: 12,
          value: 100.0,
          currency: 'USD',
        },
      ],
    });

    const prices = await tx.price.findMany({});

    await tx.pricingTarrifs.createMany({
      data: [
        {
          priceId: prices[0].id,
          provider: 'STRIPE',
          paymentType: 'ONETIME',
          providerPriceId: 'price_1NCf0bFcMJ6aXNOSRZHewfPz',
        },
        {
          priceId: prices[1].id,
          provider: 'STRIPE',
          paymentType: 'ONETIME',
          providerPriceId: 'price_1NCf0bFcMJ6aXNOSAAtdtp3x',
        },
        {
          priceId: prices[2].id,
          provider: 'STRIPE',
          paymentType: 'ONETIME',
          providerPriceId: 'price_1NCf0bFcMJ6aXNOSe7q87ORm',
        },
        {
          priceId: prices[0].id,
          provider: 'STRIPE',
          paymentType: 'RECCURING',
          providerPriceId: 'price_1NCfglFcMJ6aXNOSkqePsDKy',
        },
        {
          priceId: prices[1].id,
          provider: 'STRIPE',
          paymentType: 'RECCURING',
          providerPriceId: 'price_1NCfhuFcMJ6aXNOSli3X6NPB',
        },
        {
          priceId: prices[2].id,
          provider: 'STRIPE',
          paymentType: 'RECCURING',
          providerPriceId: 'price_1NCfiBFcMJ6aXNOSBBJurX0m',
        },
      ],
    });
  });
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(() => console.log('seeding completed'));
