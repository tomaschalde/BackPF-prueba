import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { SheltersService } from './shelters.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Shelters')
@Controller('shelters')
export class SheltersController {
  constructor(private readonly sheltersService: SheltersService) {}

  @Get()
  getShelters() {
    return this.sheltersService.getShelters();
  }

  @Get(':id')
  getShelterById(@Param('id', ParseUUIDPipe) id: string) {
    return this.sheltersService.getShelterById(id);
  }

  @Post('active/:id')
  updateShelter(id: string) {
    return this.sheltersService.updateShelter(id);
  }

  @Delete(':id')
  deleteShelter(@Param('id', ParseUUIDPipe) id: string) {
    return this.sheltersService.deleteShelter(id);
  }
}
