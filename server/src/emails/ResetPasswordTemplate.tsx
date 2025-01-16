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

interface ResetPasswordTemplateProps {
  resetLink: string;
  username: string;
}

export const ResetPasswordTemplate = ({
  resetLink,
  username,
}: ResetPasswordTemplateProps) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>Hi {username},</Text>
        <Text style={text}>
          Someone requested a password reset for your account. If this wasn't
          you, please ignore this email. Otherwise, click the button below to
          reset your password:
        </Text>
        <Link style={button} href={resetLink}>
          Reset Password
        </Link>
        <Text style={text}>
          This link will expire in 1 hour for security reasons.
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
