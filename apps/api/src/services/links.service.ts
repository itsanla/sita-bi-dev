import { PrismaClient } from '@repo/db';
import { CreateLinkDto, UpdateLinkDto } from '../dto/links.dto';
import { paginate } from '../utils/pagination.util';

// Mock data from NestJS service
interface Link {
  id: number;
  title: string;
  url: string;
  description: string;
}

export class LinksService {
  private prisma: PrismaClient;
  private readonly _links: Link[] = [
    {
      id: 0,
      title: 'Docs',
      url: 'https://turborepo.com/docs',
      description:
        'Find in-depth information about Turborepo features and API.',
    },
    {
      id: 1,
      title: 'Learn',
      url: 'https://turborepo.com/docs/handbook',
      description: 'Learn more about monorepos with our handbook.',
    },
    {
      id: 2,
      title: 'Templates',
      url: 'https://turborepo.com/docs/getting-started/from-example',
      description:
        'Choose from over 15 examples and deploy with a single click.',
    },
    {
      id: 3,
      title: 'Deploy',
      url: 'https://vercel.com/new',
      description:
        'Instantly deploy your Turborepo to a shareable URL with Vercel.',
    },
  ];

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(createLinkDto: CreateLinkDto): Promise<unknown> {
    // In a real scenario, this would interact with Prisma
    const newLink = { id: this._links.length, description: '', ...createLinkDto };
    this._links.push(newLink);
    return newLink;
  }

  async findAll(page = 1, limit = 50): Promise<unknown> {
    // In a real scenario, this would interact with Prisma
    const paginatedResult = paginate(this._links, { page, limit });
    return { ...paginatedResult, total: this._links.length };
  }

  async findOne(id: number): Promise<unknown> {
    // In a real scenario, this would interact with Prisma
    return this._links.find(link => link.id === id);
  }

  async update(id: number, updateLinkDto: UpdateLinkDto): Promise<unknown> {
    // In a real scenario, this would interact with Prisma
    const index = this._links.findIndex(link => link.id === id);
    if (index > -1) {
      this._links[index] = { id: id, title: '', url: '', description: '', ...this._links[index], ...updateLinkDto };
      return this._links[index];
    }
    return null;
  }

  async remove(id: number): Promise<unknown> {
    // In a real scenario, this would interact with Prisma
    const index = this._links.findIndex(link => link.id === id);
    if (index > -1) {
      const [removed] = this._links.splice(index, 1);
      return removed;
    }
    return null;
  }
}
