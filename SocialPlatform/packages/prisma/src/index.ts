import { PrismaClient, Prisma } from '@prisma/client';

const basePrisma = new PrismaClient();

export const prisma = basePrisma.$extends({
  query: {
    user: {
      async update({ args, query }) {
        if (args.data.gender !== undefined) {
          throw new Error('Gender is immutable and cannot be updated once set.');
        }
        return query(args);
      },
      async updateMany({ args, query }) {
        if (args.data.gender !== undefined) {
          throw new Error('Gender is immutable and cannot be updated once set.');
        }
        return query(args);
      },
    },
  },
  model: {
    user: {
      findManySameGender(gender: 'MALE' | 'FEMALE', args?: Prisma.UserFindManyArgs, blockedIds: string[] = []) {
        const context = Prisma.getExtensionContext(this) as any;
        return context.findMany({
          ...args,
          where: {
            ...args?.where,
            gender,
            id: { notIn: blockedIds },
          },
        });
      },
      findFirstSameGender(gender: 'MALE' | 'FEMALE', args?: Prisma.UserFindFirstArgs, blockedIds: string[] = []) {
        const context = Prisma.getExtensionContext(this) as any;
        return context.findFirst({
          ...args,
          where: {
            ...args?.where,
            gender,
            id: { notIn: blockedIds },
          },
        });
      },
    },
    post: {
      findManySameGender(gender: 'MALE' | 'FEMALE', args?: Prisma.PostFindManyArgs, blockedIds: string[] = []) {
        const context = Prisma.getExtensionContext(this) as any;
        return context.findMany({
          ...args,
          where: {
            ...args?.where,
            authorId: { notIn: blockedIds },
            author: {
              ...args?.where?.author,
              gender,
            },
          },
        });
      },
      findFirstSameGender(gender: 'MALE' | 'FEMALE', args?: Prisma.PostFindFirstArgs, blockedIds: string[] = []) {
        const context = Prisma.getExtensionContext(this) as any;
        return context.findFirst({
          ...args,
          where: {
            ...args?.where,
            authorId: { notIn: blockedIds },
            author: {
              ...args?.where?.author,
              gender,
            },
          },
        });
      },
    },
    group: {
      findManySameGender(gender: 'MALE' | 'FEMALE', args?: Prisma.GroupFindManyArgs) {
        const context = Prisma.getExtensionContext(this) as any;
        return context.findMany({
          ...args,
          where: {
            ...args?.where,
            gender,
          },
        });
      },
    },
    story: {
      findManySameGender(gender: 'MALE' | 'FEMALE', args?: Prisma.StoryFindManyArgs, blockedIds: string[] = []) {
        const context = Prisma.getExtensionContext(this) as any;
        return context.findMany({
          ...args,
          where: {
            ...args?.where,
            authorId: { notIn: blockedIds },
            author: {
              ...args?.where?.author,
              gender,
            },
          },
        });
      }
    },
  },
});

export * from '@prisma/client';
