import { Button, Container, Html, Link, Text } from "@react-email/components";
import * as React from "react";

export const InviteEmail = ({ registerLink }: { registerLink: string }) => {
  return (
    <Html>
      <Container style={{ textAlign: "center", fontFamily: "fantasy" }}>
        <Text style={{ fontSize: 20, fontWeight: 600 }}>
          Você foi convidado(a) para acessar o Projeto Praças
        </Text>
        <Text style={{ margin: "0px" }}>
          Utilize o endereço de e-mail em que você recebeu este e-mail.
        </Text>
        <Text style={{ marginTop: "0px" }}>
          Clique no botão abaixo para se cadastrar.
        </Text>
        <Button
          href={registerLink}
          style={{
            background: "#000",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
          }}
        >
          Cadastrar-se
        </Button>
        <Text>
          Ou clique
          <Link href={registerLink}> aqui</Link>.
        </Text>
      </Container>
    </Html>
  );
};

export default InviteEmail;
