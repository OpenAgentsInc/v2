import * as React from "react"
import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section,
  Tailwind, Text
} from "@react-email/components"

interface OpenAgentsEmailProps {
  username?: string;
}

export const OpenAgentsEmail = ({
  username = "there",
}: OpenAgentsEmailProps) => {
  const previewText = "Coding, research, marketing";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-mono px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              What AI agent can we build for you?
            </Heading>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {username},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Let me share a quick story about how AI has transformed my coding workflow:
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              As a developer, I often found myself bogged down by repetitive tasks and
              context-switching. That's when I decided to create a custom AI agent
              tailored to my specific coding needs. The results were astounding.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              My personalized coding assistant now handles everything from code
              refactoring suggestions to documentation generation. It even helps me
              stay up-to-date with the latest best practices in my tech stack. The
              boost in my productivity has been nothing short of remarkable.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Now, we want to bring that same level of efficiency and innovation to you.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-black text-[14px] leading-[24px]">
              Whether you're a coder, researcher, marketer, or any other professional,
              we can build an AI agent specifically designed for your workflow.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Imagine having an AI assistant that:
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              • Understands the nuances of your industry<br />
              • Adapts to your unique working style<br />
              • Automates your most time-consuming tasks<br />
              • Provides insights tailored to your specific needs
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              That's exactly what we offer at OpenAgents AI.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[14px] font-semibold no-underline text-center px-5 py-3"
                href="https://openagents.ai/consultation"
              >
                Schedule a Free Consultation
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-black text-[14px] leading-[24px]">
              During our consultation, we'll discuss your workflow, challenges, and goals.
              Then, our team of AI experts will design and build an agent that's
              perfectly suited to your needs.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Don't let generic AI solutions hold you back. Experience the power of a
              truly personalized AI agent.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Looking forward to helping you supercharge your productivity!
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              — The OpenAgents team
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              OpenAgents AI, 123 Tech Plaza, Silicon Valley, CA 94000
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

OpenAgentsEmail.PreviewProps = {
  username: "Alan",
} as OpenAgentsEmailProps;

export default OpenAgentsEmail;
