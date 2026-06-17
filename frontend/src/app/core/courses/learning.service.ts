import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { AuthService } from '../auth/auth.service';
import {
  CertificateDto,
  CompleteLessonResult,
  CourseDetail,
  EnrollmentSummary,
} from '../models';

/**
 * Enrollment + progress actions. Each gamifying call (enroll/complete) folds
 * the fresh XP/streak back into the cached user so the header stays in sync.
 */
@Injectable({ providedIn: 'root' })
export class LearningService {
  private readonly api = inject(ApiClient);
  private readonly auth = inject(AuthService);

  enroll(courseId: number): Promise<CourseDetail> {
    return this.api.post<CourseDetail>(`/courses/${courseId}/enroll`);
  }

  async completeLesson(lessonId: number): Promise<CompleteLessonResult> {
    const res = await this.api.post<CompleteLessonResult>(`/lessons/${lessonId}/complete`);
    this.auth.patch({ xp: res.totalXp, streakDays: res.streakDays });
    return res;
  }

  myEnrollments(): Promise<EnrollmentSummary[]> {
    return this.api.get<EnrollmentSummary[]>('/me/enrollments');
  }

  certificate(courseId: number): Promise<CertificateDto> {
    return this.api.get<CertificateDto>(`/courses/${courseId}/certificate`);
  }
}
