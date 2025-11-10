import TokenContractInterface from "../../components/token/TokenContractInterface";
import { contractIds, getBallsClient } from "../../contracts/clients";

const BallsTokenPage = () => (
  <TokenContractInterface
    title="BALLS Token"
    description="Manage the BALLS utility token: inspect balances and transfer tokens to other players."
    contractId={contractIds.balls}
    getClient={getBallsClient}
    symbolFallback="BALLS"
  />
);

export default BallsTokenPage;
