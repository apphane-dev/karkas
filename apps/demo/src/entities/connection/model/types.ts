export type ConnectionStatus = 'active' | 'inactive' | 'error'
export type ConnectionType = 'api' | 'database' | 'webhook'

export type Connection = {
	id: string
	name: string
	description: string
	type: ConnectionType
	status: ConnectionStatus
	details: string[]
}
