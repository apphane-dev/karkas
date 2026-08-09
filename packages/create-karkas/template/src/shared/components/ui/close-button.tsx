import { XIcon } from 'lucide-react'

import { IconButton, type IconButtonProps } from './icon-button'

export type CloseButtonProps = IconButtonProps

export const CloseButton = function CloseButton({ ref, ...props }: CloseButtonProps) {
	return (
		<IconButton variant="plain" colorPalette="gray" aria-label="Close" ref={ref} {...props}>
			{props.children ?? <XIcon />}
		</IconButton>
	)
}
