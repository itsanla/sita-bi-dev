import { PrismaClient, Prisma, User, Prodi } from '@repo/db';
import { paginate } from '../utils/pagination.util';
import * as bcrypt from 'bcrypt';
import { CreateDosenDto, UpdateDosenDto, UpdateMahasiswaDto } from '../dto/users.dto';
import { Role } from '../types/roles';

export class UsersService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findOneByEmail(email: string): Promise<Prisma.UserGetPayload<{ include: { roles: true } }> | null> {
    return this.prisma.user.findUnique({ where: { email }, include: { roles: true } });
  }

  async findUserById(id: number): Promise<Prisma.UserGetPayload<{ include: { roles: true, mahasiswa: true, dosen: true } }> | null> {
    return this.prisma.user.findUnique({ where: { id }, include: { roles: true, mahasiswa: true, dosen: true } });
  }

  async createMahasiswa(data: Prisma.UserCreateInput, profileData: { nim: string, prodi: Prodi, kelas: string, angkatan: string }): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        roles: {
          connect: { name: Role.mahasiswa },
        },
        mahasiswa: {
          create: {
            nim: profileData.nim,
            prodi: profileData.prodi,
            angkatan: profileData.angkatan,
            kelas: profileData.kelas,
          },
        },
      },
      include: {
        mahasiswa: true,
      },
    });
  }

  async createDosen(dto: CreateDosenDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Selalu tambahkan peran 'dosen' secara default
    const rolesToConnect = [{ name: Role.dosen }];

    // Tambahkan peran lain dari DTO jika ada dan valid
    if (dto.roles) {
      const validRoles = [Role.kajur, Role.kaprodi_d3, Role.kaprodi_d4];
      dto.roles.forEach(roleName => {
        if (roleName !== Role.dosen && validRoles.includes(roleName)) {
          rolesToConnect.push({ name: roleName });
        }
      });
    }

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        roles: {
          connect: rolesToConnect,
        },
        dosen: {
          create: {
            nidn: dto.nidn,
          },
        },
      },
      include: {
        dosen: true,
        roles: true,
      },
    });
  }

  async updateDosen(id: number, dto: UpdateDosenDto): Promise<User> {
    const userData: Prisma.UserUpdateInput = {};

    if (dto.name != null) userData.name = dto.name;
    if (dto.email != null) userData.email = dto.email;
    if (dto.password != null) userData.password = await bcrypt.hash(dto.password, 10);
    if (dto.roles != null) {
      userData.roles = {
        set: dto.roles.map(roleName => ({ name: roleName }))
      };
    }
    if (dto.nidn != null) {
      userData.dosen = {
        update: { nidn: dto.nidn },
      };
    }

    return this.prisma.user.update({
      where: { id },
      data: userData,
      include: { dosen: true, roles: true },
    });
  }

  async updateMahasiswa(id: number, dto: UpdateMahasiswaDto): Promise<User> {
    const userData: Prisma.UserUpdateInput = {};
    const mahasiswaData: Prisma.MahasiswaUpdateInput = {};

    if (dto.name != null) userData.name = dto.name;
    if (dto.email != null) userData.email = dto.email;
    if (dto.password != null) userData.password = await bcrypt.hash(dto.password, 10);
    
    if (dto.nim != null) mahasiswaData.nim = dto.nim;
    if (dto.prodi != null) mahasiswaData.prodi = dto.prodi;
    if (dto.angkatan != null) mahasiswaData.angkatan = dto.angkatan;
    if (dto.kelas != null) mahasiswaData.kelas = dto.kelas;

    if (Object.keys(mahasiswaData).length > 0) {
      userData.mahasiswa = {
        update: mahasiswaData,
      };
    }

    return this.prisma.user.update({
      where: { id },
      data: userData,
      include: { mahasiswa: true, roles: true },
    });
  }

  async findAllMahasiswa(page = 1, limit = 50): Promise<unknown> {
    const skip = (page - 1) * limit;
    const take = limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take,
        where: { mahasiswa: { isNot: null } },
        select: {
          id: true,
          name: true,
          email: true,
          mahasiswa: {
            select: {
              nim: true,
              prodi: true,
              angkatan: true,
              kelas: true,
            },
          },
          roles: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          id: 'asc'
        }
      }),
      this.prisma.user.count({ where: { mahasiswa: { isNot: null } } }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllDosen(page = 1, limit = 50): Promise<unknown> {
    const skip = (page - 1) * limit;
    const take = limit;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take,
        where: { dosen: { isNot: null } },
        select: {
          id: true,
          name: true,
          email: true,
          dosen: {
            select: {
              nidn: true,
            },
          },
          roles: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          id: 'asc'
        }
      }),
      this.prisma.user.count({ where: { dosen: { isNot: null } } }),
    ]);

    const data = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      nidn: user.dosen?.nidn,
      roles: user.roles.map(r => r.name)
    }));
    
    return {
      data: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteUser(id: number): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return this.prisma.user.delete({ where: { id } });
  }

  async updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}