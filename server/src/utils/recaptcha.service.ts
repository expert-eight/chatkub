import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecaptchaService {
  constructor(private httpService: HttpService) {}

  async verify(token: string): Promise<boolean> {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // Google reCAPTCHA v3 verification URL
    const url = 'https://www.google.com/recaptcha/api/siteverify';

    const response = await firstValueFrom(
      this.httpService.post(
        url,
        new URLSearchParams({
          secret: secretKey, // reCAPTCHA secret key
          response: token, // reCAPTCHA token from the client
        }),
      ),
    );

    // Check if the verification was successful and return the result
    return response.data.success && response.data.score >= 0.5;
  }
}
