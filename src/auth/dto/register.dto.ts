import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(1, { message: '이름을 입력하세요.' })
  name: string;

  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.',
  })
  password: string;

  @IsString()
  @MinLength(8)
  passwordConfirm: string;
}
