export type AuthUser = {
	id: string
	name: string
	email: string
}

export type LoginCredentials = {
	email: string
	password: string
}

export type AuthSession = {
	token: string
	user: AuthUser
}
