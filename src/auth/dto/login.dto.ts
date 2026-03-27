import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

/** 로그인 방식: 이메일·비밀번호 또는 GitHub OAuth 안내 */
export enum AuthProvider {
  LOCAL = 'local',
  GITHUB = 'github',
}

export class LoginDto {
  @IsOptional()
  @IsEnum(AuthProvider, {
    message: 'provider는 local 또는 github 이어야 합니다.',
  })
  provider?: AuthProvider;

  @ValidateIf((o: LoginDto) => !o.provider || o.provider === AuthProvider.LOCAL)
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email?: string;

  @ValidateIf((o: LoginDto) => !o.provider || o.provider === AuthProvider.LOCAL)
  @IsString()
  @MinLength(1, { message: '비밀번호를 입력하세요.' })
  password?: string;
}
