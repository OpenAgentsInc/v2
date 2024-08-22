interface InferProps {
  messages: any[]
  tools: any[]
}

export async function infer({ messages, tools }: InferProps) {
  return {
    response: "Test inference."
  }
}
