import type { ActivityItem } from '#entities/dashboard'

import { m } from '#paraglide/messages.js'
import { Avatar, Card, Table } from '#shared/components'
import { styled } from '#styled-system/jsx'

export function RecentActivityList({ recentActivity }: { recentActivity: ActivityItem[] }) {
	return (
		<Card.Root p="5" borderWidth="1px" borderColor="border" borderRadius="xl" bg="gray.1">
			<styled.div fontSize="sm" fontWeight="semibold" mb="4">
				{m.dashboard_recent_activity()}
			</styled.div>
			<styled.div overflowX="auto">
				<Table.Root variant="surface" interactive size="md" borderRadius="md" overflow="hidden">
					<Table.Head>
						<Table.Row>
							<Table.Header>{m.dashboard_col_activity()}</Table.Header>
							<Table.Header textAlign="right">{m.dashboard_col_time()}</Table.Header>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{recentActivity.map((item) => (
							<Table.Row key={item.id}>
								<Table.Cell whiteSpace="normal">
									<styled.div display="flex" alignItems="center" gap="2.5" minW="0">
										<Avatar.Root w="6" h="6" flexShrink={0}>
											<Avatar.Fallback
												name={item.user}
												bg="colorPalette.3"
												fontSize="2xs"
												fontWeight="bold"
												color="colorPalette.11"
											/>
										</Avatar.Root>
										<styled.div minW="0" fontSize="sm">
											<styled.span fontWeight="medium">{item.user}</styled.span>{' '}
											<styled.span color="muted">{item.action}</styled.span>{' '}
											<styled.span fontWeight="medium">{item.target}</styled.span>
										</styled.div>
									</styled.div>
								</Table.Cell>
								<Table.Cell textAlign="right" color="muted" whiteSpace="nowrap">
									{item.time}
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</styled.div>
		</Card.Root>
	)
}
