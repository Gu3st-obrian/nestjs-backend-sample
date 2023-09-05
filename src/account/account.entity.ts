import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class DtoCreateSession {
    @ApiProperty({
        title: "Phone number",
        description: "User phone number",
        type: String,
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({
        title: "Email address",
        description: "User email address",
        type: String,
    })
    @IsOptional()
    @IsEmail()
    email?: string;


    @ApiProperty({
        title: "Password",
        description: "User account password",
        type: String,
        required: true,
    })
    @IsString()
    password?: string;
}

export class DtoNewToken {
    @ApiProperty({
        title: "Token",
        description: "Token session after a proper login",
        type: String,
        required: true,
    })
    @IsString()
    access_token?: string;
    
    @ApiProperty({
        title: "Refresh Token",
        description: "Token value for session renewal",
        type: String,
        required: true,
    })
    @IsString()
    refresh_token?: string;
}

export class DtoCreateIdentity {
    
    @ApiProperty({
        title: "Phone Number",
        description: "User phone number",
        type: String,
        required: true,
    })
    @IsString()
    phone?: string;

    @ApiProperty({
        title: "Email",
        description: "User email address",
        type: String,
        default: "",
    })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty({
        title: "Email",
        description: "User email address",
        type: String,
        default: "",
    })
    @IsOptional()
    @IsString()
    inviteLink?: string;
}

export class DtoConfirmIdentity {
    
    @ApiProperty({
        title: "Code OTP",
        description: "Verification code OTP value",
        type: String,
        required: true,
    })
    @IsString()
    code?: string;
}

export class DtoResentCodeIdentity {
    
    @ApiProperty({
        title: "Phone Number",
        description: "User phone number",
        type: String,
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({
        title: "Email",
        description: "User email address",
        type: String,
    })
    @IsOptional()
    @IsString()
    email?: string;
}

export class DtoUpdateIdentity {

    @ApiProperty({
        title: "User PK",
        description: "User unique identity value",
        type: String,
        required: true,
    })
    @IsString()
    userPK?: string;
    
    @ApiProperty({
        title: "User Firstname",
        description: "Contains user firstname",
        type: String,
        required: true,
    })
    @IsString()
    firstname?: string;

    @ApiProperty({
        title: "User Lastname",
        description: "Contains user lastname",
        type: String,
        required: true,
    })
    @IsString()
    lastname?: string;

    @ApiProperty({
        title: "Password",
        description: "User password",
        type: String,
        required: true,
    })
    @IsString()
    password?: string;
}


export class DtoCreateNetworkUserByAdmin {
    
    @ApiProperty({
        title: "Phone Number",
        description: "User phone number",
        type: String,
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({
        title: "Email",
        description: "User email address",
        type: String,
    })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty({
        title: "User Firstname",
        description: "Contains user firstname",
        type: String,
        required: true,
    })
    @IsString()
    firstname?: string;

    @ApiProperty({
        title: "User Lastname",
        description: "Contains user lastname",
        type: String,
        required: true,
    })
    @IsString()
    lastname?: string;
}