import { Buffer } from "buffer";
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CCSMRVZW77HXGDBVXUTDAM5MOH4AX6DS2O7CWY3TEVAUHGJFEYN7LWJP",
    },
};
