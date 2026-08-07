import type { StoryContext } from '@storybook/react-vite'
import type { BaseActor } from 'kahraman'

import { createActor as createKahramanActor } from 'kahraman'

export { button, heading, link, role, text } from 'kahraman'
export { withDetailError, withPageError, withRetryAndLoading } from './pageActor'

type AppActor<T extends object = Record<never, never>> = BaseActor &
	T & {
		init(context: StoryContext): void
		extend<U extends object>(extension: (current: BaseActor & T) => U): AppActor<T & U>
	}

// kahraman 0.1.1 accepts Storybook 10.4's setup signature, but Storybook 10.4
// also types keyboard() as Promise<void> rather than the newer Promise<System>.
// Keep the renderer context widening until kahraman models that difference too.
export const createActor = () => createKahramanActor() as unknown as AppActor
