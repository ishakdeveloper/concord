import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ConfirmEmailTemplateProps {
  confirmLink: string;
  username: string;
}

export const ConfirmEmailTemplate = ({
  confirmLink,
  username,
}: ConfirmEmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>Confirm your email address</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm your email address</Heading>
        <Text style={text}>Hi {username},</Text>
        <Text style={text}>
          Please confirm your email address by clicking the button below:
        </Text>
        <Link style={button} href={confirmLink}>
          Confirm Email
        </Link>
        <Text style={text}>
          If you didn't request this email, you can safely ignore it.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'system-ui',
};

const container = {
  padding: '20px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '50px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '200px',
};
