import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConceptController } from './concepts.controller';
import { ConceptService } from './concepts.service';
import { Concept } from './entities/concept.entity';
import { ConceptImage } from './entities/concept-image.entity';
import { ConceptQuiz } from './entities/concept-quiz.entity';
import { ConceptQuizBlank } from './entities/concept-quiz-blank.entity';
import { ConceptQuizSubmission } from './entities/concept-quiz-submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Concept,
      ConceptImage,
      ConceptQuiz,
      ConceptQuizBlank,
      ConceptQuizSubmission,
    ]),
  ],
  controllers: [ConceptController],
  providers: [ConceptService],
  exports: [ConceptService],
})
export class ConceptModule {}
