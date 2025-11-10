import React from "react";
import { Code, Layout, Text } from "@stellar/design-system";
import Card from "../components/Card";
import { TeaDashboard } from "../components/TeaDashboard";

const Home: React.FC = () => (
  <Layout.Content>
    <Layout.Inset>
      <Text as="h1" size="xl">
        Welcome to your app!
      </Text>
      <Text as="p" size="md">
        This is a basic template to get your dapp started with the Stellar
        Design System and Stellar contracts. You can customize it further by
        adding your own contracts, components, and styles.
      </Text>

      <Card
        name={["Stellar Tea", "Common"]}
        mainImage={{
          src: "/assets/stellar-tea-001.png",
          alt: "Stellar Tea illustration",
        }}
        borderColor="oklch(28.55% 0.09665440679544547 265.51146531290146)"
      />

      <Text as="h2" size="lg">
        Contract integrations
      </Text>
      <Text as="p" size="md">
        Bindings are generated straight from production Soroban contracts. You
        can reuse the clients in <Code size="md">src/contracts/clients.ts</Code>
        .
      </Text>
      <Text as="p" size="md">
        The dashboard below shows BALLS/STARS balances, contract identifiers,
        and the <Code size="md">claim_daily</Code> action from the game
        contract.
      </Text>
      <TeaDashboard />
      <Text as="h2" size="lg">
        Interact with wallets
      </Text>
      <Text as="p" size="md">
        This project is already integrated with Stellar Wallet Kit, and the{" "}
        <Code size="md">useWallet</Code> hook is available for you to use in
        your components. You can use it to connect to get connected account
        information.
      </Text>
      <Text as="h2" size="lg">
        Deploy your app
      </Text>
      <Text as="p" size="md">
        To deploy your contracts, use the{" "}
        <Code size="md">stellar registry publish</Code> and
        <Code size="md">stellar registry deploy</Code> commands ( use{" "}
        <Code size="md">stellar registry --help</Code> for more info ) to deploy
        to the appropriate Stellar network.
      </Text>
      <Text as="p" size="md">
        Build your frontend application code with{" "}
        <Code size="md">npm run build</Code> and deploy the output in the
        <Code size="md">dist/</Code> directory.
      </Text>
    </Layout.Inset>
  </Layout.Content>
);

export default Home;
