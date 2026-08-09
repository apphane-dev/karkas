import type { TopPage } from '#entities/dashboard'

import { m } from '#paraglide/messages.js'
import { Card, Progress, Table } from '#shared/components'
import { styled } from '#styled-system/jsx'

export function TopPagesList({ topPages }: { topPages: TopPage[] }) {
	return (
		<Card.Root p="5" borderWidth="1px" borderColor="border" borderRadius="xl" bg="gray.1">
			<styled.div fontSize="sm" fontWeight="semibold" mb="4">
				{m.dashboard_top_pages()}
			</styled.div>
			<styled.div overflowX="auto">
				<Table.Root
					variant="surface"
					interactive
					columnBorder
					size="md"
					minW="520px"
					borderRadius="md"
					overflow="hidden"
				>
					<Table.Head>
						<Table.Row>
							<Table.Header>{m.dashboard_col_page()}</Table.Header>
							<Table.Header textAlign="right">{m.dashboard_col_views()}</Table.Header>
							<Table.Header>{m.dashboard_col_traffic_share()}</Table.Header>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{topPages.map((page) => (
							<Table.Row key={page.path}>
								<Table.Cell fontWeight="medium" color="gray.12">
									{page.path}
								</Table.Cell>
								<Table.Cell textAlign="right" color="muted">
									{page.views.toLocaleString()}
								</Table.Cell>
								<Table.Cell>
									<styled.div display="flex" alignItems="center" gap="3" minW="180px">
										<Progress.Root value={page.percent} flex="1">
											<Progress.Track h="1.5" bg="gray.4" borderRadius="full" overflow="hidden">
												<Progress.Range
													h="100%"
													bg="colorPalette.9"
													borderRadius="full"
													transition="width 0.3s"
												/>
											</Progress.Track>
										</Progress.Root>
										<styled.span fontSize="xs" color="muted" fontVariantNumeric="tabular-nums">
											{page.percent}%
										</styled.span>
									</styled.div>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			</styled.div>
		</Card.Root>
	)
}
