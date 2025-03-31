import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { map, catchError, lastValueFrom, firstValueFrom } from 'rxjs';
import * as https from 'https';

@Injectable()
export class GiftTruewalletService {
  constructor(private http: HttpService) {}

  async request(url: string, method: string, body: any | null): Promise<any> {
    const requestConfig: AxiosRequestConfig = {
      method: method,
      url: url,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36 Edg/84.0.522.52',
        'Content-Type': 'application/json',
      },
      httpsAgent: new https.Agent({
        maxVersion: 'TLSv1.3',
        minVersion: 'TLSv1.3',
      }),
      data: body ? body : null,
    };

    return firstValueFrom(this.http.request(requestConfig))
      .then((res) => res.data)
      .catch((e) => {
        // console.log(e.response.data);

        throw new BadRequestException(e.response.data);
      });
  }

  async verifyVoucher(code: string, mobile: string): Promise<any> {
    const result = await this.request(
      `https://gift.truemoney.com/campaign/vouchers/${code}/verify?mobile=${mobile}`,
      'get',
      null,
    );
    return result;
  }

  async redeemVoucher(code: string, mobile: string): Promise<any> {
    try {
      const result = await this.request(
        `https://gift.truemoney.com/campaign/vouchers/${code}/redeem`,
        'POST',
        {
          mobile,
          voucher_hash: code,
        },
      );

      return result;
    } catch {
      return false;
    }
  }
}
