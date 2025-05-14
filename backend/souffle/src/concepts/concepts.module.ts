import { Module } from '@nestjs/common';
import { ConceptController } from './concepts.controller';
import { ConceptService } from './concepts.service';

@Module({
  controllers: [ConceptController],
  providers: [ConceptService],
})
export class ConceptModule {}
