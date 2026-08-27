"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const basePrisma = new client_1.PrismaClient();
exports.prisma = basePrisma.$extends({
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
            findManySameGender(gender, args, blockedIds = []) {
                const context = client_1.Prisma.getExtensionContext(this);
                return context.findMany({
                    ...args,
                    where: {
                        ...args?.where,
                        gender,
                        id: { notIn: blockedIds },
                    },
                });
            },
            findFirstSameGender(gender, args, blockedIds = []) {
                const context = client_1.Prisma.getExtensionContext(this);
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
            findManySameGender(gender, args, blockedIds = []) {
                const context = client_1.Prisma.getExtensionContext(this);
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
            findFirstSameGender(gender, args, blockedIds = []) {
                const context = client_1.Prisma.getExtensionContext(this);
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
            findManySameGender(gender, args) {
                const context = client_1.Prisma.getExtensionContext(this);
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
            findManySameGender(gender, args, blockedIds = []) {
                const context = client_1.Prisma.getExtensionContext(this);
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
__exportStar(require("@prisma/client"), exports);
