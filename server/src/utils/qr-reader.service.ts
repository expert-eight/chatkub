import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

@Injectable()
export class QrReaderService {
  constructor(private readonly http: HttpService) {}

  async request(url: string, body: any, headers: any = {}): Promise<any> {
    const requestConfig: AxiosRequestConfig = {
      method: 'post',
      url: `${process.env.QR_READER_URL}${url}`,
      headers,
      data: body,
      timeout: 20000,
    };
    return firstValueFrom(this.http.request(requestConfig))
      .then((res) => res.data)
      .catch((e) => {
        console.log(e);
        throw new BadRequestException(e.response.data);
      });
  }

  async scanQr(file: any): Promise<any> {
    const formData = new FormData();

    formData.append('image', file.buffer, file.originalname);
    return await this.request('/decode', formData, {
      ...formData.getHeaders(),
    });
  }
}
