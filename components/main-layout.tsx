import { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

export interface MainLayoutProps {
  header: ReactNode
  children: ReactNode
}

export function MainLayout({ header, children }: MainLayoutProps): JSX.Element {
  return (
    <div>
      <Box
        display="flex"
        top="0"
        position="sticky"
        marginX="auto"
        width="full"
        maxWidth="3xl"
        gap="2"
        paddingY="4"
        fontSize="3xl"
        fontWeight="bold"
        alignItems="center"
        lineHeight="10"
        bgColor="chakra-body-bg"
        zIndex="sticky"
      >
        {header}
      </Box>
      <Box
        marginX="auto"
        maxWidth="3xl"
        style={{ height: 'calc(100vh - 4.5rem)' }}
      >
        {children}
      </Box>
    </div>
  )
}
