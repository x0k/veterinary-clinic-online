import { ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

export interface MainLayoutProps {
  header: ReactNode
  children: ReactNode
}

export function MainLayout({ header, children }: MainLayoutProps): JSX.Element {
  return (
    <>
      <Box
        display="flex"
        top="0"
        position="sticky"
        marginX="auto"
        width="full"
        maxWidth="3xl"
        gap="2"
        padding="4"
        fontSize={{
          base: 'xl',
          md: '3xl',
        }}
        fontWeight="bold"
        lineHeight="10"
        bgColor="chakra-body-bg"
        zIndex="sticky"
      >
        {header}
      </Box>
      <Box
        marginX="auto"
        maxWidth="3xl"
        paddingX="4"
        minHeight="calc(100vh - 4.5rem)"
      >
        {children}
      </Box>
    </>
  )
}
