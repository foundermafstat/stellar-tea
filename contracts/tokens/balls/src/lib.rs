#![no_std]

pub mod admin;
pub mod allowance;
pub mod balance;
pub mod burn;
pub mod metadata;

mod contract;

pub use contract::BallsToken;

#[cfg(test)]
mod tests {
    extern crate std;

    use soroban_sdk::{testutils::Address as _, Address, Env};

    use crate::contract::{BallsToken, BallsTokenClient};
    use crate::metadata;

    fn init_client(e: &Env, admin: &Address) -> BallsTokenClient {
        let contract_id = e.register(BallsToken, (admin.clone(),));
        BallsTokenClient::new(e, &contract_id)
    }

    #[test]
    fn constructor_mints_initial_supply() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let client = init_client(&env, &admin);

        let balance = client.balance(admin.clone());
        assert_eq!(balance, metadata::INITIAL_SUPPLY);
    }

    #[test]
    fn admin_can_mint() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let recipient = Address::generate(&env);
        let client = init_client(&env, &admin);

        let amount = 1_000;
        client.mint(recipient.clone(), amount);

        assert_eq!(client.balance(recipient), amount);
    }
}
