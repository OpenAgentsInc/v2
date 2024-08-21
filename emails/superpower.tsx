import * as React from "react"
import {
  Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section,
  Tailwind, Text
} from "@react-email/components"

interface OpenAgentsEmailProps {
  balance?: number;
}

export const OpenAgentsEmail = ({
  balance
}: OpenAgentsEmailProps) => {
  const previewText = "Coding, research, marketing";

  const formattedBalance = balance ? (balance / 100).toFixed(2) : "0.00";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-mono px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-bold text-center p-0 my-[30px] mx-0">
              What AI agent can we build for you?
            </Heading>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-black text-[14px] leading-[24px]">
              Hey folks, quick note:
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              After a year of using & building different AI tools, I now code <span className="font-bold">~3 times faster</span> than I did in 2022.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Today I primarily use the new{" "}
              <Link href="https://openagents.com" style={link}>
                OpenAgents v2 platform
              </Link>{" "} &mdash; and I'm excited you now have access to the same tool.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              One problem right now: the v2 site is optimized for <span className="font-bold">MY</span> workflow!
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              It's time to change that.
            </Text>
            {balance && balance > 0 && (
              <Text className="text-black text-[14px] leading-[24px]">
                By the way, you have a current balance of ${formattedBalance} so you can test out the advanced models like Claude 3.5 Sonnet!
              </Text>
            )}
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-black text-[14px] leading-[24px]">
              Our long-term goal is to make it easy for anyone to build, use and sell the world's most powerful agents all through OpenAgents.com.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              For now we want to work closely with a few select users to build custom agents that dramatically improve their productivity.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              So if you can fill in this sentence: <span className="font-bold">"If my AI agent could automate _____, I'd pay _____.\"</span>
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              ...then please book a 15-minute call with me and let's plan to build you a custom OpenAgent.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[14px] font-semibold no-underline text-center px-5 py-3"
                href="https://calendly.com/christopher-david-openagents/custom-agent-consultation"
              >
                Schedule a call with me
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-black text-[14px] leading-[24px]">
              Otherwise please give our new self-serve{" "}
              <Link href="https://openagents.com" style={link}>
                OpenAgents v2 platform
              </Link>{" "} a try. You can use it to:
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              • Connect to your GitHub codebase<br />
              • Intelligently navigate multiple webpages<br />
              • Write anything you need, just like ChatGPT or Claude<br />
              • Connect to any API: now GitHub, soon many more (requests welcome!)<br />
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We want to give you AI superpowers! Just tell us what superpowers you'd find most valuable. :)
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Best regards
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Chris
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

const link = {
  fontWeight: 'bold',
  textDecoration: "underline",
};

OpenAgentsEmail.PreviewProps = {
  balance: 1000,
} as OpenAgentsEmailProps;

export default OpenAgentsEmail;