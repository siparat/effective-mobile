export const AuthStrategyKey = {
	JWT: 'jwt'
} satisfies Record<string, string>;

export const AuthErrorMessages = {
	UNAUTHORIZED: 'Пользователь не авторизован',
	ALREADY_EXISTS: 'Пользователь с таким email уже существует',
	WRONG_PASSWORD: 'Неверный пароль'
} satisfies Record<string, string>;
