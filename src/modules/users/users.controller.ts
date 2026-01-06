import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    return new UserResponseDto(user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [users, total] = await this.usersService.findAllWithPagination(
      parseInt(page),
      parseInt(limit),
    );

    return {
      users: users.map((user) => new UserResponseDto(user)),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }

  @Get('me')
  async getProfile(@Request() req): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(req.user.id);
    return new UserResponseDto(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return new UserResponseDto(user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ): Promise<UserResponseDto> {
    // Users can update themselves, admins can update anyone
    if (req.user.id !== id && !req.user.canAccessAdmin()) {
      throw new Error('Unauthorized');
    }

    const user = await this.usersService.update(id, updateUserDto);
    return new UserResponseDto(user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  // Admin endpoints
  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async changeRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.changeUserRole(id, role);
    return new UserResponseDto(user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async changeStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.changeUserStatus(id, status as any);
    return new UserResponseDto(user);
  }
}
