use soroban_sdk::{Env, String};
use stellar_tokens::fungible::Base;

pub const DECIMALS: u32 = 8;
pub const NAME: &str = "STARS Premium Token";
pub const SYMBOL: &str = "STARS";
pub const INITIAL_SUPPLY_UNITS: i128 = 10_000_000_000;
pub const DECIMAL_FACTOR: i128 = 100_000_000;
pub const INITIAL_SUPPLY: i128 = INITIAL_SUPPLY_UNITS * DECIMAL_FACTOR;

pub fn init_metadata(env: &Env) {
    Base::set_metadata(
        env,
        DECIMALS,
        String::from_str(env, NAME),
        String::from_str(env, SYMBOL),
    );
}
