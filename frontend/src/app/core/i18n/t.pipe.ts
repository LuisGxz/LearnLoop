import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from './language.service';
import { CopyKey } from './copy';

/**
 * Template sugar for translations: {{ 'nav.catalog' | t }}. Impure so it
 * re-evaluates when the language signal flips.
 */
@Pipe({ name: 't', pure: false })
export class TPipe implements PipeTransform {
  private readonly i18n = inject(LanguageService);

  transform(key: CopyKey): string {
    return this.i18n.t(key);
  }
}
