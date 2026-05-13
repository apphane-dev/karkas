import { retryComputed, wrap } from '@reatom/core'

import { fetchConnectionById, fetchConnections } from '#entities/connection'
import { m } from '#paraglide/messages.js'
import { isApiError } from '#shared/api'
import { rootRoute } from '#shared/router'
import { PageError } from '#widgets/data-page'
import { MasterDetails } from '#widgets/master-details'

import { ConnectionsPageLoading } from '../ui/ConnectionsPageLoading'
import { ConnectionDetail } from '../ui/detail/ConnectionDetail'
import { ConnectionDetailLoadingState } from '../ui/detail/ConnectionDetailLoadingState'
import { ConnectionNoSelection } from '../ui/detail/ConnectionNoSelection'
import { ConnectionNotFound } from '../ui/detail/ConnectionNotFound'
import { ConnectionList } from '../ui/list/ConnectionList'
import { reatomConnectionDetailModel } from './connectionDetailModel'

export const connectionsRoute = rootRoute.reatomRoute(
	{
		path: 'connections',
		loader: fetchConnections,
		render: (self) => {
			const selectedConnectionId = connectionDetailRoute()?.connectionId
			const { isFirstPending, isPending, data: connections } = self.loader.status()
			if (isFirstPending || (isPending && !connections)) {
				return <ConnectionsPageLoading showDetail={selectedConnectionId !== undefined} />
			}

			if (!connections) {
				return (
					<PageError
						title={m.connections_error_title()}
						description={m.connections_error_description()}
						onRetry={wrap(() => retryComputed(self.loader))}
					/>
				)
			}

			return (
				<MasterDetails
					isDetailVisible={selectedConnectionId !== undefined}
					masterLabel={m.nav_connections()}
					detailLabel={m.connection_detail()}
					master={
						<ConnectionList
							connections={connections.map((connection) => ({
								connection,
								href: connectionDetailRoute.path({ connectionId: connection.id }),
							}))}
							selectedId={selectedConnectionId}
						/>
					}
					detail={self.outlet().at(0) ?? <ConnectionNoSelection />}
				/>
			)
		},
	},
	'connections',
)

export const connectionDetailRoute = connectionsRoute.reatomRoute(
	{
		path: ':connectionId',
		loader: async ({ connectionId }) =>
			reatomConnectionDetailModel(await fetchConnectionById(connectionId)),
		render: (self) => {
			const { isPending, data: model } = self.loader.status()
			const error = self.loader.error()
			if (isPending) return <ConnectionDetailLoadingState />
			if (error && !(isApiError(error) && error.status === 404)) {
				return (
					<PageError
						title={m.connection_detail_error_title()}
						description={m.connection_detail_error_description()}
						onRetry={wrap(() => retryComputed(self.loader))}
					/>
				)
			}
			return model ? (
				<ConnectionDetail model={model} />
			) : (
				<ConnectionNotFound connectionId={self().connectionId} />
			)
		},
	},
	'connectionDetail',
)
