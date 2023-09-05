import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Response } from 'express';
import { firstValueFrom, Observable } from 'rxjs';
import { CountryCode, NatsPatterns } from '../app.constant';
import { RoleDocument } from '../role/role.schema';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { ICommon } from './common.entity';

@Injectable()
export class CommonService {
    private readonly logger = new Logger(CommonService.name);

    constructor(
        @Inject('POLICY_SERVICE') private nats: ClientProxy,
        private readonly configService: ConfigService
    ) { }

    public async http(payload: AxiosRequestConfig): Promise<ICommon> {
        const response: ICommon = {
            statusCode: HttpStatus.OK,
        };

        const requests: AxiosRequestConfig = {
            baseURL: this.configService.get('app.baseUrl'),
            headers: {
                // Authorization: `Bearer ${token}`,
            },
            ...payload,
        };

        this.logger.debug('http.requests', JSON.stringify(requests));

        await axios
            .request(requests)
            .then((r: AxiosResponse) => {
                if (r.data) {
                    this.logger.log('http.data', JSON.stringify(r.data));
                    response.values = r.data;
                }
            })
            .catch((e: any) => {
                this.logger.error('http.error', e);
                response.statusCode =
                    e.response && e.response.status
                        ? e.response.status
                        : HttpStatus.UNPROCESSABLE_ENTITY;
                response.reason = e.response ? e.response.data : e.message || '';
            });

        return response;
    }

    /**
     * Nats endpoint to verify user policies
     */
    public async emitPolicyVerification(path: string, method: string, policies: Array<RoleDocument>): Promise<boolean | null> {
        try {
            // Check user login permission.
            const source$ = this.sendMessage(NatsPatterns.Authorization, {
                tag: this.configService.get<string>('app.tag'),
                path, method, policies,
            });

            return await firstValueFrom(source$);
        } catch (error) {
            return null;
        }
    }

    public sendMessage(pattern: string, data: any): Observable<any> {
        try {
            return this.nats.send(pattern, data);
        } catch (error) {
            return null;
        }
    }

    public emitMessage(pattern: string, data: any): Observable<any> {
        try {
            return this.nats.emit(pattern, data);
        } catch (error) {
            return null;
        }
    }

    public generateId(input?: string): string {
        return input ? uuidv5(input, this.configService.get<string>("app.namespace")) : uuidv4();
    }

    public render(response: Response, status: HttpStatus, other: any): ICommon {
        const data: ICommon = {
            statusCode: status
        }
    
        if (typeof other === "string") {
            data.reason = other;
        } else {
            data.values = other;
        }
    
        return response.status(status).send(data);
    }

    public isValidPhoneNumber(phone: string, country = CountryCode.Benin): boolean {
        switch (String(country).toUpperCase()) {
            case CountryCode.Benin:
                return /\d{8}$/.test(phone);
            default:
                return false;
        }
    }

    public buildQueryRequest = (query: any): any => {
        if (!query.page || isNaN(query.page)) {
            query.page = 0;
        } else {
            query.page = parseInt(query.page);
            query.page = query.page > 0 ? query.page - 1 : 0;
        }
    
        if (!query.size || isNaN(query.size)) {
            query.size = 20;
        } else {
            query.size = parseInt(query.size);
            query.size = query.size >= 0 ? query.size : 20;
        }
    
        if (query.meta) {
            try {
                query.meta = JSON.parse(query.meta);
            } catch (error) {
                query.meta = null;
            }
        }
    
        return query;
    }
}
