import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { Public } from "./common/decorators/public.decorator";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Public()
    @Get()
    getHello() {
        return {
            message: this.appService.getHello(),
            api: 'Car Rental Management API',
            version: '1.0',
            status: 'running',
            docs: '/api/docs'
        };
    }
}