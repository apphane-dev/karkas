import type { Connection } from '#entities/connection'

import { Plus } from 'lucide-react'

import { m } from '#paraglide/messages.js'
import { IconButton } from '#shared/components'
import { styled } from '#styled-system/jsx'
import { ListToolbar } from '#widgets/data-page'

import { ConnectionStatusBadge } from '../ConnectionStatusBadge'
import { ConnectionTypeBadge } from '../ConnectionTypeBadge'

type Props = {
	connections: { connection: Connection; href: string }[]
	selectedId: string | undefined
}

export function ConnectionList({ connections, selectedId }: Props) {
	return (
		<>
			<ListToolbar placeholder={m.connection_search_placeholder()}>
				<IconButton size="sm" variant="outline" aria-label={m.connection_new()}>
					<Plus />
				</IconButton>
			</ListToolbar>
			<styled.ul role="list" aria-label={m.nav_connections()} listStyleType="none" p="0" m="0">
				{connections.map(({ connection, href }) => (
					<styled.li key={connection.id}>
						<styled.a
							href={href}
							display="block"
							w="100%"
							textAlign="left"
							px="4"
							py="3"
							cursor="pointer"
							textDecoration="none"
							color="inherit"
							bg={selectedId === connection.id ? 'gray.surface.bg.active' : 'transparent'}
							_hover={{ bg: 'gray.surface.bg.active' }}
							borderBottomWidth="1px"
							borderColor="border"
							aria-current={selectedId === connection.id ? 'page' : undefined}
						>
							<styled.div display="flex" alignItems="center" justifyContent="space-between" gap="2">
								<styled.span fontWeight="medium" fontSize="sm" truncate>
									{connection.name}
								</styled.span>
								<ConnectionStatusBadge status={connection.status} />
							</styled.div>
							<styled.div display="flex" alignItems="center" gap="2" mt="1">
								<ConnectionTypeBadge type={connection.type} />
								<styled.span fontSize="xs" color="muted" lineClamp={1}>
									{connection.description}
								</styled.span>
							</styled.div>
						</styled.a>
					</styled.li>
				))}
			</styled.ul>
		</>
	)
}
