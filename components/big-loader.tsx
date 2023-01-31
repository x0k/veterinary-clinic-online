import { Center, CircularProgress } from '@chakra-ui/react'

export function BigLoader(): JSX.Element {
  return (
    <Center minHeight="inherit">
      <CircularProgress isIndeterminate color="teal.500" size="8rem" />
    </Center>
  )
}
