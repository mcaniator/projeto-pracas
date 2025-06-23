import { Button, Container, Html, Link, Text } from "@react-email/components";
import * as React from "react";

const PasswordResetEmail = ({
  passwordResetLink,
}: {
  passwordResetLink: string;
}) => {
  return (
    <Html>
      <Container style={{ textAlign: "center", fontFamily: "fantasy" }}>
        <Text style={{ fontSize: 16, fontWeight: 600 }}>
          Você solicitou uma redefinição de senha para o Projeto Praças
        </Text>
        <Text style={{ marginTop: "0px" }}>
          Clique no botão abaixo para redefinir a senha.
        </Text>
        <Button
          href={passwordResetLink}
          style={{
            background: "#000",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
          }}
        >
          Redefinir senha
        </Button>
        <Text>
          Ou clique
          <Link href={passwordResetLink}> aqui</Link>.
        </Text>
      </Container>
    </Html>
  );
};

export default PasswordResetEmail;
