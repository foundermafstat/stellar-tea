use soroban_sdk::{Env, String};
use stellar_tokens::non_fungible::Base;

pub const NAME: &str = "Stellar Tea Collection";
pub const SYMBOL: &str = "TEA";
pub const DEFAULT_BASE_URI: &str = "ipfs://stellar-tea/";

pub fn init_metadata(env: &Env) {
    Base::set_metadata(
        env,
        String::from_str(env, DEFAULT_BASE_URI),
        String::from_str(env, NAME),
        String::from_str(env, SYMBOL),
    );
}

pub fn set_metadata(env: &Env, base_uri: String, name: String, symbol: String) {
    Base::set_metadata(env, base_uri, name, symbol);
}
