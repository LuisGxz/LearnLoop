import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { AuthService } from '../auth/auth.service';
import { Answer, QuizResult, QuizView } from '../models';

/** Quiz taking. Submit grades server-side and returns per-question results. */
@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly api = inject(ApiClient);
  private readonly auth = inject(AuthService);

  /** Questions only — correct options are never sent to the client. */
  view(quizId: number): Promise<QuizView> {
    return this.api.get<QuizView>(`/quizzes/${quizId}`);
  }

  async submit(quizId: number, answers: Answer[]): Promise<QuizResult> {
    const res = await this.api.post<QuizResult>(`/quizzes/${quizId}/submit`, { answers });
    this.auth.patch({ xp: res.totalXp });
    return res;
  }
}
