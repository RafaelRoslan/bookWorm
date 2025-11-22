import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Article, ArticleType } from '../../models/api.models';
import { ArticlePayload, ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-article-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './article-admin.component.html',
  styleUrl: './article-admin.component.css'
})
export class ArticleAdminComponent {

    loading = true;
  saving = false;
  error = '';
  isEdit = false;
  articleId: string | null = null;

  typeOptions: ArticleType[] = ['article', 'news'];

  form: FormGroup;

  // controle de banner, igual lógica da capa
  initialBanner: string | null = null; // valor original vindo do back
  clearBanner = false; // “remover banner” na edição

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(4)]],
      type: ['article' as ArticleType, [Validators.required]],
      summary: ['', [Validators.required, Validators.minLength(10)]],
      contentText: ['', [Validators.required, Validators.minLength(10)]],
      bannerImage: [''], // base64 ou '' ou undefined
      authorName: ['', [Validators.required]],
      authorBioName: [''],
      authorBioText: [''],
      authorAvatarUrl: [''],
      publishedAt: [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.articleId = id;
    this.isEdit = !!id;

    if (!id) {
      this.loading = false;
      return;
    }

    this.articleService.getArticleById(id).subscribe({
      next: (article) => {
        this.patchForm(article);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar artigo para edição:', err);
        this.error = 'Não foi possível carregar o artigo.';
        this.loading = false;
      },
    });
  }

  private patchForm(article: Article): void {
    this.initialBanner = article.bannerImage ?? null;
    this.clearBanner = false;

    this.form.patchValue({
      title: article.title,
      type: article.type,
      summary: article.summary,
      contentText: article.content.join('\n\n'),
      bannerImage: article.bannerImage ?? '',
      authorName: article.authorName,
      authorBioName: article.authorBio?.name ?? '',
      authorBioText: article.authorBio?.bio ?? '',
      authorAvatarUrl: article.authorBio?.avatarUrl ?? '',
      publishedAt: article.publishedAt
        ? article.publishedAt.slice(0, 10)
        : '',
    });
  }

  // === IMAGEM DO BANNER (igual capa) ===
  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const maxBytes = 200 * 1024; // 200kb
    const maxWidth = 800; // pode ajustar

    this.readAndCompressImage(file, maxWidth, maxBytes)
      .then((base64) => {
        this.form.patchValue({ bannerImage: base64 });
        this.clearBanner = false; // se escolheu imagem nova, não limpar
      })
      .catch((err) => console.error('Erro ao processar banner', err));
  }

  private readAndCompressImage(
    file: File,
    maxWidth: number,
    maxBytes: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        return reject('Arquivo não é imagem');
      }

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = async () => {
          try {
            const base64 = await this.toCompressedDataURL(
              img,
              file.type,
              maxWidth,
              maxBytes
            );
            resolve(base64);
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private toCompressedDataURL(
    img: HTMLImageElement,
    mime: string,
    maxWidth: number,
    maxBytes: number
  ): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      const supportsQuality = /jpeg|jpg|webp/i.test(mime);
      let quality = supportsQuality ? 0.85 : 1.0;

      const toSize = (b64: string) => {
        const pure = b64.split(',')[1] || '';
        return Math.floor((pure.length * 3) / 4);
      };

      let dataUrl = canvas.toDataURL(
        supportsQuality ? 'image/jpeg' : mime,
        quality
      );
      let bytes = toSize(dataUrl);

      while (bytes > maxBytes && supportsQuality && quality > 0.4) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        bytes = toSize(dataUrl);
      }

      if (bytes > maxBytes && w > 320) {
        const newMax = Math.max(320, Math.floor(w * 0.8));
        resolve(this.toCompressedDataURL(img, mime, newMax, maxBytes));
        return;
      }

      resolve(dataUrl);
    });
  }

  /** Igual a resolveImageForEdit do livro, mas para banner */
  private resolveBannerForEdit(): string | undefined {
    const init = this.initialBanner ?? null;
    const cur = (this.form.value.bannerImage as string | null) ?? null;

    // se marcar "limpar banner"
    if (this.clearBanner) return '';

    // sem mudança
    if (init === cur) return undefined;

    // trocou/adicionou
    if (cur) return cur;

    return undefined;
  }

  private buildPayload(): ArticlePayload {
    const value = this.form.value;

    const rawContent = (value.contentText ?? '') as string;

    const paragraphs: string[] = rawContent
      .split('\n')
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);

    const payload: ArticlePayload = {
      title: value.title!,
      type: (value.type as ArticleType) ?? 'article',
      summary: value.summary!,
      content: paragraphs,
      authorName: value.authorName!,
    };

    if (value.authorBioName || value.authorBioText || value.authorAvatarUrl) {
      payload.authorBio = {
        name: value.authorBioName || value.authorName || '',
        bio: value.authorBioText || '',
        avatarUrl: value.authorAvatarUrl || '',
      };
    }

    if (value.publishedAt) {
      payload.publishedAt = new Date(value.publishedAt).toISOString();
    }

    const isEdit = this.isEdit && !!this.articleId;

    if (isEdit) {
      const decided = this.resolveBannerForEdit();
      if (decided !== undefined) {
        payload.bannerImage = decided;
      }
    } else {
      const cur = (value.bannerImage as string | null) ?? null;
      // criar: se anexou, manda base64; senão, manda '' igual livro
      payload.bannerImage = cur ? cur : '';
    }

    return payload;
  }

  private saveArticle(payload: ArticlePayload) {
    if (this.isEdit && this.articleId) {
      return this.articleService.updateArticle(this.articleId, payload);
    }
    return this.articleService.createArticle(payload);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    this.saving = true;
    this.error = '';

    this.saveArticle(payload).subscribe({
      next: (article) => {
        this.saving = false;
        this.router.navigate(['/article', article.id]);
      },
      error: (err) => {
        console.error('Erro ao salvar artigo:', err);
        this.error = 'Não foi possível salvar o artigo.';
        this.saving = false;
      },
    });
  }

}
