export interface ErrorTextProps {
  text?: string
}

export function ErrorText({
  text = 'Произошла ошибка',
}: ErrorTextProps): JSX.Element {
  return <p className="text-center text-error">{text}</p>
}
