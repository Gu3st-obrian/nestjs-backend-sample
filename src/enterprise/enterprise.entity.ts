import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class DtoCreateEnterprise {
    @ApiProperty({
        title: "Name",
        description: "Enterprise denomination",
        type: String,
    })
    @IsString()
    name?: string;

    @ApiProperty({
        title: "Email address",
        description: "User email address",
        type: String,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        title: "Admin user",
        description: "Owner of this enterprise",
        type: String,
    })
    @IsString()
    ownerPK: string;

    @ApiProperty({
        title: "RCCM",
        description: "Enterprise RCCM",
        type: String,
    })
    @IsString()
    rccm: string;

    @ApiProperty({
        title: "IFU",
        description: "Enterprise IFU",
        type: String,
    })
    @IsString()
    ifu: string;
}