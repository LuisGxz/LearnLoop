import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../api/api-client';
import { CourseDetail, CourseSummary } from '../models';

/** Read/write access to courses. Screens own their own loading state. */
@Injectable({ providedIn: 'root' })
export class CourseService {
  private readonly api = inject(ApiClient);

  /** Public catalog; when authenticated, items carry the viewer's progress. */
  catalog(): Promise<CourseSummary[]> {
    return this.api.get<CourseSummary[]>('/courses');
  }

  /** Courses owned by the signed-in instructor. */
  mine(): Promise<CourseSummary[]> {
    return this.api.get<CourseSummary[]>('/courses/mine');
  }

  detail(id: number): Promise<CourseDetail> {
    return this.api.get<CourseDetail>(`/courses/${id}`);
  }
}
