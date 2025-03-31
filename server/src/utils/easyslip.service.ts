import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EasySlipService {
  constructor(private readonly http: HttpService) {}

  async request(url: string, headers: any = {}): Promise<any> {
    const requestConfig: AxiosRequestConfig = {
      method: 'get',
      url: `https://developer.easyslip.com${url}`,
      headers,
    };
    return firstValueFrom(this.http.request(requestConfig))
      .then((res) => res.data)
      .catch((e) => {
        console.log(e);
        throw new BadRequestException(e.response.data);
      });
  }

  async verifySlip(qrtext: string, api_key: string): Promise<any> {
    return await this.request(`/api/v1/verify?payload=${qrtext.toString()}`, {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${api_key}`,
    });
  }
}
