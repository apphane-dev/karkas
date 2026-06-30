export type Message = {
	id: string
	sender: string
	text: string
	time: string
	isOwn: boolean
}

export type Conversation = {
	id: string
	name: string
	lastMessage: string
	time: string
	unread: number
	online: boolean
	messages: Message[]
}
