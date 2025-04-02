export const AuthStrategyKey = {
	JWT: 'jwt'
} satisfies Record<string, string>;

export const AuthErrorMessages = {
	UNAUTHORIZED: 'Пользователь не авторизован',
	ALREADY_EXISTS: 'Пользователь с таким email уже существует',
	NOT_FOUND: 'Пользователь не найден',
	WRONG_PASSWORD: 'Неверный пароль',
	WRONG_ENTITY: 'Неполные данные сущности'
} satisfies Record<string, string>;
