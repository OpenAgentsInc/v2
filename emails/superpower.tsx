import * as React from "react"
import {
  Body, Button, Container, Head, Hr, Html, Img, Link, Preview, Section, Text
} from "@react-email/components"

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const OpenAgentsEmail = () => (
  <Html>
    <Head>
      <style>{`
        @media (prefers-color-scheme: dark) {
          body, .email-body {
            background-color: #000000 !important;
          }
          .email-container {
            background-color: #1a1a1a !important;
          }
          .email-text {
            color: #ffffff !important;
          }
          .email-button {
            background-color: #00ff00 !important;
            color: #000000 !important;
          }
          .email-link {
            color: #00ff00 !important;
          }
          .email-footer {
            color: #888888 !important;
          }
        }
      `}</style>
    </Head>
    <Preview>Welcome to OpenAgents AI Marketplace!</Preview>
    <Body style={main} className="email-body">
      <Container style={container} className="email-container">
        <Section style={box}>
          <Img
            src={`${baseUrl}/static/openagents-logo.png`}
            width="49"
            height="21"
            alt="OpenAgents"
          />
          <Hr style={hr} />
          <Text style={paragraph} className="email-text">
            Thank you for joining the OpenAgents AI Marketplace. You're now ready to
            explore and utilize our diverse range of AI agents!
          </Text>
          <Text style={paragraph} className="email-text">
            You can view available agents, your usage, and manage your account
            right from your dashboard.
          </Text>
          <Button style={button} href="https://dashboard.openagents.ai/login" className="email-button">
            View your OpenAgents Dashboard
          </Button>
          <Hr style={hr} />
          <Text style={paragraph} className="email-text">
            If you're new to our platform, you might find our{" "}
            <Link style={anchor} href="https://openagents.ai/docs" className="email-link">
              documentation
            </Link>{" "}
            helpful.
          </Text>
          <Text style={paragraph} className="email-text">
            To start using AI agents, simply browse our marketplace and select
            the agents that fit your needs. You can access your{" "}
            <Link
              style={anchor}
              href="https://dashboard.openagents.ai/login?redirect=%2Fapikeys"
              className="email-link"
            >
              API keys
            </Link>{" "}
            to integrate agents into your projects.
          </Text>
          <Text style={paragraph} className="email-text">
            We've also prepared a{" "}
            <Link
              style={anchor}
              href="https://openagents.ai/docs/getting-started"
              className="email-link"
            >
              quick start guide
            </Link>{" "}
            to help you make the most of our AI marketplace.
          </Text>
          <Text style={paragraph} className="email-text">
            Our team is here to assist you every step of the way. For questions
            and support, please visit our{" "}
            <Link style={anchor} href="https://support.openagents.ai/" className="email-link">
              support center
            </Link>
            .
          </Text>
          <Text style={paragraph} className="email-text">— The OpenAgents team</Text>
          <Hr style={hr} />
          <Text style={footer} className="email-footer">
            OpenAgents AI, 123 Tech Plaza, Silicon Valley, CA 94000
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default OpenAgentsEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "'Courier New', Courier, monospace",
  color: "#000000",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const paragraph = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
};

const anchor = {
  color: "#0000ff",
};

const button = {
  backgroundColor: "#00ff00",
  borderRadius: "5px",
  color: "#000000",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "10px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};
