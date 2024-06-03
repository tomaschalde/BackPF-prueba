import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateShelterDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Oscar',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'Debe ser un Email',
    example: 'example@gmail.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '********',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&.*])/, {
    message:
      'Debe contener al menos una letra minúscula, una letra mayúscula, un número y un caracter especial',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Debe ser un Numero de DNI',
    example: '44654321',
  })
  dni: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Debe ser un numero de telefono',
    example: '1133445566',
  })
  phone?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Refugio',
  })
  shelterName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Ubicacion',
  })
  locality: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '...',
  })
  description: string;

  @IsEmpty()
  exotic_animals: boolean;

  @IsEmpty()
  isActive: boolean;
}
