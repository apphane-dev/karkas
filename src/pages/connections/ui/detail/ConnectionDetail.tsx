import type { ConnectionDetailModel } from '../../model/connectionDetailModel'

import { wrap } from '@reatom/core'
import { reatomComponent } from '@reatom/react'

import { m } from '#paraglide/messages.js'
import { Button, Heading, Text } from '#shared/components'
import { styled } from '#styled-system/jsx'

import { ConnectionStatusBadge } from '../ConnectionStatusBadge'
import { ConnectionTypeBadge } from '../ConnectionTypeBadge'

export const ConnectionDetail = reatomComponent(({ model }: { model: ConnectionDetailModel }) => {
	const { connection, reconnect, testConnection } = model

	return (
		<styled.div p="8">
			<styled.div display="flex" alignItems="center" gap="3" mb="6" flexWrap="wrap">
				<Heading as="h1" fontSize="2xl" fontWeight="bold" flex="1">
					{connection.name}
				</Heading>
				<ConnectionTypeBadge type={connection.type} />
				<ConnectionStatusBadge status={connection.status} />
				{connection.status === 'error' && (
					<Button size="sm" onClick={wrap(() => reconnect())}>
						{m.connection_reconnect()}
					</Button>
				)}
				<Button size="sm" variant="outline" onClick={wrap(() => testConnection())}>
					{m.connection_test()}
				</Button>
			</styled.div>
			<Text color="muted" fontSize="sm" lineHeight="relaxed">
				{connection.description}
			</Text>
			<styled.div display="grid" gap="4" mt="6">
				{connection.details.map((paragraph, index) => (
					<Text key={index} color="muted" fontSize="sm" lineHeight="relaxed">
						{paragraph}
					</Text>
				))}
			</styled.div>
		</styled.div>
	)
}, 'ConnectionDetail')
