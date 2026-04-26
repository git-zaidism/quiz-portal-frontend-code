import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiErrorResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorService {
  getMessage(error: unknown, fallback = 'Something went wrong.'): string {
    if (error instanceof HttpErrorResponse) {
      const apiError = error.error as ApiErrorResponse | string | null;
      if (typeof apiError === 'string' && apiError.trim()) {
        return apiError;
      }
      if (apiError && typeof apiError === 'object' && 'message' in apiError) {
        return apiError.message || fallback;
      }
      if (error.message) {
        return error.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  }

  getFieldErrors(error: unknown): Record<string, string> {
    if (!(error instanceof HttpErrorResponse)) {
      return {};
    }

    const apiError = error.error as ApiErrorResponse | null;
    if (!apiError || typeof apiError !== 'object') {
      return {};
    }

    return apiError.fieldErrors ?? {};
  }
}
