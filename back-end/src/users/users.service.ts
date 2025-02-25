import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<GetUserDto[]> {
    const users = await this.userRepository.find({});

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      score: user.score,
      photo: user.photo || '',
      avatar: user.avatar || '',
      color: user.color || '',
      description: user.description || '',
    }));
  }

  async resetAllScore(): Promise<{ message: string }> {
    await this.userRepository.update({}, { score: 0 });
    return { message: 'Tous les scores ont été réinitialisés à zéro.' };
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ success: boolean; message: string }> {
    const existingEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail) {
      return { success: false, message: 'Cet email est déjà utilisé.' };
    }

    const existingUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUsername) {
      return { success: false, message: "Ce nom d'utilisateur est déjà pris." };
    }

    const user = this.userRepository.create(createUserDto);
    await this.userRepository.save(user);

    return { success: true, message: 'Compte créé avec succès !' };
  }

  async savePushToken(userId: number, expoPushToken: string): Promise<void> {
    await this.userRepository.update(userId, { pushToken: expoPushToken });
  }

  async findOne(userId: number): Promise<GetUserDto | null> {
    const foundUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!foundUser) return null;

    return {
      id: foundUser.id,
      username: foundUser.username,
      score: foundUser.score,
      photo: foundUser.photo || '',
      email: foundUser.email,
      avatar: foundUser.avatar || '',
      color: foundUser.color || '',
      description: foundUser.description || '',
    };
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(user: User, options = {}): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: { id: user.id },
      ...options,
    });
    if (!foundUser) {
      throw new NotFoundException(`User with ID ${user.id} not found`);
    }
    return foundUser;
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(
        `Utilisateur avec l'ID ${userId} introuvable`,
      );
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async deleteUserPhoto(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    if (user.photo) {
      const filePath = `/home/debian/back-end/uploads/${user.photo.split('/').pop()}`;

      // Supprime le fichier localement
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error('❌ Erreur lors de la suppression du fichier :', err);
      }
    }

    // Supprime la photo en base
    user.photo = '';
    await this.userRepository.save(user);
  }
}
