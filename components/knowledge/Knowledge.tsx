import { Button } from "../ui/button"

export const Knowledge = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Button onClick={() => console.log('clicked')}>Click me</Button>
    </div>
  )
}
