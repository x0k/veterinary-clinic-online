import { CircularProgress } from '@chakra-ui/react'

export function BigLoader(): JSX.Element {
  return (
    <div className="grow flex flex-col justify-center">
      <CircularProgress isIndeterminate color="teal.500" size="8rem" />
    </div>
  )
}
