import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class QrGenService {
  constructor(private httpService: HttpService) {}

  async request(path: string, data: any) {
    const url = `${process.env.QR_GEN_URL}${path}`;

    const headers = { 'Content-Type': 'application/json' };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data, { headers }).pipe(
          timeout(10000), // Timeout ที่ 5 วินาที (5000 milliseconds)
        ),
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async generateQrCode(text: any): Promise<string> {
    const result = await this.request('/generate-qr', {
      data: text,
      watermark_text: 'ชำระเงิน PowerTopup เท่านั้น',
      font_size: 22,
      font_color: [255, 0, 0],
      opacity: 0.65,
    });
    return result.qr_code_base64;
  }
}
