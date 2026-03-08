import { BaseService } from "./base.service.js";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
  const suffix = Date.now().toString(36).slice(-5);
  return `${base}-${suffix}`;
}

const spotInclude = {
  tags: true,
  User: { select: { id: true, username: true, image: true } },
};

export class SpotService extends BaseService<typeof prisma.spot> {
  constructor() {
    super(prisma.spot);
  }

  async getAllPublic(page: number, pageSize: number) {
    const where = { public: true, active: true };
    const [total, spots] = await Promise.all([
      prisma.spot.count({ where }),
      prisma.spot.findMany({
        where,
        include: spotInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { spots, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getAllAdmin(page: number, pageSize: number) {
    const [total, spots] = await Promise.all([
      prisma.spot.count(),
      prisma.spot.findMany({
        include: spotInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { spots, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findByIdWithRelations(id: string) {
    const spot = await prisma.spot.findUnique({
      where: { id },
      include: spotInclude,
    });
    if (!spot) throw new AppError("Spot not found", 404);
    return spot;
  }

  async findBySlug(slug: string) {
    const spot = await prisma.spot.findUnique({
      where: { slug },
      include: spotInclude,
    });
    if (!spot) throw new AppError("Spot not found", 404);
    return spot;
  }

  async getMySpots(userId: string, page: number, pageSize: number) {
    const where = { userId };
    const [total, spots] = await Promise.all([
      prisma.spot.count({ where }),
      prisma.spot.findMany({
        where,
        include: spotInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { spots, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getNearby(
    lat: number,
    lon: number,
    radiusKm: number,
    page: number,
    pageSize: number,
  ) {
    type RawRow = { id: string; distance_km: number };

    const [countResult, rows] = await Promise.all([
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint AS count FROM (
          SELECT id,
            (6371.0 * acos(
              LEAST(1.0::float8,
                cos(radians(${lat}::float8)) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lon}::float8))
                + sin(radians(${lat}::float8)) * sin(radians(latitude))
              )
            )) AS distance_km
          FROM "Spot"
          WHERE public = true AND active = true
            AND latitude IS NOT NULL AND longitude IS NOT NULL
        ) AS h
        WHERE h.distance_km <= ${radiusKm}::float8
      `,
      prisma.$queryRaw<RawRow[]>`
        SELECT id, distance_km FROM (
          SELECT id,
            (6371.0 * acos(
              LEAST(1.0::float8,
                cos(radians(${lat}::float8)) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lon}::float8))
                + sin(radians(${lat}::float8)) * sin(radians(latitude))
              )
            )) AS distance_km
          FROM "Spot"
          WHERE public = true AND active = true
            AND latitude IS NOT NULL AND longitude IS NOT NULL
        ) AS h
        WHERE h.distance_km <= ${radiusKm}::float8
        ORDER BY h.distance_km ASC
        LIMIT ${pageSize}::int OFFSET ${(page - 1) * pageSize}::int
      `,
    ]);

    const total = Number(countResult[0].count);

    if (!rows.length) {
      return { spots: [], total, page, pageSize, totalPages: 0 };
    }

    const distanceMap = new Map(rows.map((r) => [r.id, Number(r.distance_km)]));
    const orderedIds = rows.map((r) => r.id);

    const spots = await prisma.spot.findMany({
      where: { id: { in: orderedIds } },
      include: spotInclude,
    });

    const sorted = orderedIds
      .map((id) => spots.find((s) => s.id === id)!)
      .filter(Boolean)
      .map((s) => ({ ...s, distanceKm: distanceMap.get(s.id)! }));

    return {
      spots: sorted,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async createSpot(
    data: {
      name: string;
      address?: string;
      place?: string;
      description?: string;
      images?: string[];
      latitude?: number;
      longitude?: number;
      public?: boolean;
      tags?: string[];
    },
    userId: string,
  ) {
    const { tags, ...spotData } = data;
    const slug = generateSlug(data.name);

    return prisma.spot.create({
      data: {
        ...spotData,
        slug,
        userId,
        tags: tags ? { connect: tags.map((id) => ({ id })) } : undefined,
      },
      include: spotInclude,
    });
  }

  async updateSpot(
    id: string,
    data: {
      name?: string;
      address?: string;
      place?: string;
      description?: string;
      images?: string[];
      latitude?: number;
      longitude?: number;
      public?: boolean;
      active?: boolean;
      tags?: string[];
    },
    userId: string,
    isAdmin: boolean,
  ) {
    const spot = await this.findByIdWithRelations(id);

    if (spot.userId !== userId && !isAdmin) {
      throw new AppError("Forbidden: you do not own this spot", 403);
    }

    const { tags, ...spotData } = data;

    return prisma.spot.update({
      where: { id },
      data: {
        ...spotData,
        tags: tags
          ? { set: tags.map((tagId) => ({ id: tagId })) }
          : undefined,
      },
      include: spotInclude,
    });
  }

  async deleteSpot(id: string, userId: string, isAdmin: boolean) {
    const spot = await this.findByIdWithRelations(id);

    if (spot.userId !== userId && !isAdmin) {
      throw new AppError("Forbidden: you do not own this spot", 403);
    }

    return prisma.spot.delete({ where: { id } });
  }

  async toggleActive(id: string, userId: string, isAdmin: boolean) {
    const spot = await this.findByIdWithRelations(id);

    if (spot.userId !== userId && !isAdmin) {
      throw new AppError("Forbidden: you do not own this spot", 403);
    }

    return prisma.spot.update({
      where: { id },
      data: { active: !spot.active },
      include: spotInclude,
    });
  }

  async togglePublic(id: string, userId: string, isAdmin: boolean) {
    const spot = await this.findByIdWithRelations(id);

    if (spot.userId !== userId && !isAdmin) {
      throw new AppError("Forbidden: you do not own this spot", 403);
    }

    return prisma.spot.update({
      where: { id },
      data: { public: !spot.public },
      include: spotInclude,
    });
  }
}

export const spotService = new SpotService();
