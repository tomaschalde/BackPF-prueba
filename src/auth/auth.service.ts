import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from 'src/entidades/user.entity';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShelterEntity } from 'src/entidades/shelter.entity';
import { MailService } from 'src/mails/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ShelterEntity)
    private shelterRepository: Repository<ShelterEntity>,
    private readonly mailService: MailService,
  ) {}

  async RegisterUser(
    email: string,
    password: string,
    metadata: Partial<UserEntity>,
    accessToken: string,
  ) {
    await this.mailService.registerUserMail(email,metadata.name,password)
    return this.Register(email, password, metadata, accessToken, 'user');
  }

  async RegisterShelter(
    email: string,
    password: string,
    metadata: Partial<ShelterEntity>,
    accessToken: string,
  ) {
    const existingShelter = await this.shelterRepository.findOne({
      where: {
        shelter_name: metadata.shelter_name,
        zona: metadata.zona,
      },
    });
  
    if (existingShelter) {
      throw new ConflictException('A shelter with the same name already exists in this zone.');
    }
    await this.mailService.registershelterMail(email,metadata.shelter_name,password)
    return this.Register(email, password, metadata, accessToken, 'shelter');
  }

  async Register(
    email: string,
    password: string,
    metadata: Partial<UserEntity> | Partial<ShelterEntity>,
    accessToken: string,
    type: 'user' | 'shelter',
  ) {
    const existingUser = await this.userRepository.findOneBy({ email });
    const existingShelter = await this.shelterRepository.findOneBy({ email });

    if (existingUser || existingShelter) {
      throw new ConflictException('Este email ya se encuentra asociado a un usuario');
    }

    if (type === 'shelter') {
      const existingShelterDNI = await this.shelterRepository.findOneBy({ dni: (metadata as ShelterEntity).dni });
      if (existingShelterDNI) {
        throw new ConflictException('Este DNI ya se encuentra asociado a un refugio');
      }
    }

    try {
      await axios.post(
        `https://dev-r34ulqlg6mkaafee.us.auth0.com/api/v2/users`,
        {
          email,
          password,
          connection: 'Username-Password-Authentication',
          user_metadata: metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (type === 'user') {
        await this.userRepository.save({
          ...metadata,
          email,
        } as Partial<UserEntity>);
      } else if (type === 'shelter') {
        await this.shelterRepository.save({
          ...metadata,
          email,
        } as Partial<ShelterEntity>);
      }
      return { succes: 'Usuario registrado correctamente' };
    } catch (error) {
      throw new BadRequestException('Error creating user');
    }
  }

  async Login(email: string, password: string) {

    const existingAccoutUser = await this.userRepository.findOneBy({ email });
    const existingAccountShelter = await this.shelterRepository.findOneBy({ email });

    if (!existingAccoutUser && !existingAccountShelter) {
      throw new ConflictException('Correo inexistente en nuestros registros');
    }

    try {
      const response = await axios.post(
        `https://dev-r34ulqlg6mkaafee.us.auth0.com/oauth/token`,
        {
          client_id: 'Tt1y2DI6R5aNCzY7wRrodth6msACmGBz',
          client_secret: 'o4QCuqVfAf0PqqpkWtOrxFHOlPthXUtTkcvZ-WiPQemK855_6U-tUTeZfrmwvc2O',
          audience: 'https://dev-r34ulqlg6mkaafee.us.auth0.com/api/v2/',
          grant_type: 'password',
          username: email,
          password: password,
          scope: 'openid profile email', 
        },
      );

      const { access_token, id_token } = response.data;

      return { succes: 'Usuario logueado correctamente', id_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
