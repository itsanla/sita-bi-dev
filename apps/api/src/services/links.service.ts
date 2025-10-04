import type { CreateLinkDto, UpdateLinkDto } from '../dto/links.dto';
import { paginate } from '../utils/pagination.util';

// Mock data from NestJS service
interface Link {
  id: number;
  title: string;
  url: string;
  description?: string;
}

export class LinksService {
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

  create(createLinkDto: CreateLinkDto): unknown {
    const newLink: Link = {
      id: this._links.length,
      title: createLinkDto.title,
      url: createLinkDto.url,
    };

    if (createLinkDto.description != null) {
      newLink.description = createLinkDto.description;
    }

    this._links.push(newLink);
    return newLink;
  }

  findAll(page = 1, limit = 50): unknown {
    const paginatedResult = paginate(this._links, { page, limit });
    return { ...paginatedResult, total: this._links.length };
  }

  findOne(id: number): unknown {
    return this._links.find((link) => link.id === id);
  }

  update(id: number, updateLinkDto: UpdateLinkDto): unknown {
    const index = this._links.findIndex((link) => link.id === id);
    if (index > -1) {
      const existingLink = this._links[index];
      if (existingLink) {
        const updatedLink = { ...existingLink };
        if (updateLinkDto.title != null) {
          updatedLink.title = updateLinkDto.title;
        }
        if (updateLinkDto.url != null) {
          updatedLink.url = updateLinkDto.url;
        }
        if (updateLinkDto.description != null) {
          updatedLink.description = updateLinkDto.description;
        }
        this._links[index] = updatedLink;
        return this._links[index];
      }
    }
    return null;
  }

  remove(id: number): unknown {
    const index = this._links.findIndex((link) => link.id === id);
    if (index > -1) {
      const [removed] = this._links.splice(index, 1);
      return removed;
    }
    return null;
  }
}
