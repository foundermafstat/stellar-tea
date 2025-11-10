#![no_std]

pub mod admin;
pub mod allowance;
pub mod balance;
pub mod burn;
pub mod metadata;

mod contract;

pub use contract::StarsToken;

#[cfg(test)]
mod tests {
    extern crate std;

    use soroban_sdk::{testutils::Address as _, Address, Env};

    use crate::contract::{StarsToken, StarsTokenClient};
    use crate::metadata;

    fn init_client(e: &Env, admin: &Address) -> StarsTokenClient {
        let contract_id = e.register(StarsToken, (admin.clone(),));
        StarsTokenClient::new(e, &contract_id)
    }

    #[test]
    fn constructor_assigns_supply() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let client = init_client(&env, &admin);

        assert_eq!(client.balance(admin.clone()), metadata::INITIAL_SUPPLY);
    }
}

