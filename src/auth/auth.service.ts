import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Admin } from '../entities/admin.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.adminRepository.findOne({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const { password: _, ...result } = admin;
    return result;
  }

  async login(loginDto: LoginDto) {
    const admin = await this.validateAdmin(loginDto.email, loginDto.password);
    const payload = { email: admin.email, sub: admin.id };
    
    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        email: admin.email,
      },
    };
  }

  async createAdmin(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = this.adminRepository.create({
      email,
      password: hashedPassword,
    });
    
    return this.adminRepository.save(admin);
  }
}