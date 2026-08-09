import { m } from '#paraglide/messages.js'
import { MasterDetails } from '#widgets/master-details'

import { ConnectionDetailLoadingState } from './detail/ConnectionDetailLoadingState'
import { ConnectionListLoading } from './list/ConnectionListLoading'

type ConnectionsPageLoadingProps = {
	showDetail: boolean
}

export function ConnectionsPageLoading({ showDetail }: ConnectionsPageLoadingProps) {
	return (
		<div role="status" aria-label={m.connections_loading_page()}>
			<div inert>
				<MasterDetails
					isDetailVisible={showDetail}
					masterLabel={m.nav_connections()}
					detailLabel={m.connection_detail()}
					master={<ConnectionListLoading />}
					detail={<ConnectionDetailLoadingState />}
				/>
			</div>
		</div>
	)
}
