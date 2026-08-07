'use client'
import { Portal } from '@ark-ui/react/portal'
import { Toaster as ArkToaster, Toast as ArkToast, useToastContext } from '@ark-ui/react/toast'
import { CheckCircleIcon, CircleAlertIcon, CircleXIcon } from 'lucide-react'

import { createStyleContext, Stack, styled } from '#styled-system/jsx'
import { toast } from '#styled-system/recipes'

import { CloseButton } from './close-button'
import { Icon, type IconProps } from './icon'
import { Spinner } from './spinner'
import { toaster } from './toaster'

const { withProvider, withContext } = createStyleContext(toast)

const Root = withProvider(ArkToast.Root, 'root')
const Title = withContext(ArkToast.Title, 'title')
const Description = withContext(ArkToast.Description, 'description')
const ActionTrigger = withContext(ArkToast.ActionTrigger, 'actionTrigger')
const CloseTrigger = withContext(ArkToast.CloseTrigger, 'closeTrigger')
const StyledToaster = styled(ArkToaster)

const iconMap: Record<string, React.ElementType> = {
	warning: CircleAlertIcon,
	success: CheckCircleIcon,
	error: CircleXIcon,
}

const Indicator = ({ ref, ...props }: IconProps) => {
	const toast = useToastContext()

	const StatusIcon = iconMap[toast.type]
	if (!StatusIcon) return null

	return (
		<Icon ref={ref} data-type={toast.type} {...props}>
			<StatusIcon />
		</Icon>
	)
}

const Toast = {
	Root,
	Title,
	Description,
	ActionTrigger,
	CloseTrigger,
	StyledToaster,
	Indicator,
}

export const Toaster = () => {
	return (
		<Portal>
			<StyledToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
				{(toast) => (
					<Toast.Root>
						{toast.type === 'loading' ? (
							<Spinner color="colorPalette.plain.fg" />
						) : (
							<Toast.Indicator />
						)}

						<Stack gap="3" alignItems="start">
							<Stack gap="1">
								{toast.title && <Toast.Title>{toast.title}</Toast.Title>}
								{toast.description && <Toast.Description>{toast.description}</Toast.Description>}
							</Stack>
							{toast.action && <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>}
						</Stack>
						{toast.closable && (
							<Toast.CloseTrigger asChild>
								<CloseButton size="sm" />
							</Toast.CloseTrigger>
						)}
					</Toast.Root>
				)}
			</StyledToaster>
		</Portal>
	)
}
