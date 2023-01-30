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
        flexDirection={{ base: 'column', sm: 'row' }}
        top="0"
        position="sticky"
        marginX="auto"
        width="full"
        maxWidth="3xl"
        gap="2"
        padding="4"
        fontSize={{
          base: 'xl',
          md: "3xl"
        }}
        fontWeight="bold"
        alignItems={{
          base: 'stretch',
          sm: 'normal'
        }}
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
        paddingY="2"
        height={{
          sm: "calc(100vh - 4.5rem)"
        }}
      >
        {children}
      </Box>
    </div>
  )
}
