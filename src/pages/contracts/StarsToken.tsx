import TokenContractInterface from "../../components/token/TokenContractInterface";
import { contractIds, getStarsClient } from "../../contracts/clients";

const StarsTokenPage = () => (
  <TokenContractInterface
    title="STARS Token"
    description="Work with the premium STARS token: inspect metadata, check balances, and send transfers."
    contractId={contractIds.stars}
    getClient={getStarsClient}
    symbolFallback="STARS"
  />
);

export default StarsTokenPage;
